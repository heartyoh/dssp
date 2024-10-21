import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { createAttachment, deleteAttachmentsByRef, ATTACHMENT_PATH } from '@things-factory/attachment-base'
import { Project, ProjectState } from './project'
import { NewProject, ProjectPatch, UploadProjectScheduleTable } from './project-type'
import { BuildingComplex, Building, BuildingLevel } from '@dssp/building-complex'
import { pdfToImage } from '@things-factory/board-service/dist-server/controllers/headless-pdf-to-image'

@Resolver(Project)
export class ProjectMutation {
  @Directive('@transaction')
  @Mutation(returns => Project, { description: '프로젝트 생성' })
  async createProject(@Arg('project') project: NewProject, @Ctx() context: ResolverContext): Promise<Project> {
    const { domain, user, tx } = context.state
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)

    const newBuildingComplex = await buildingComplexRepo.save({
      domain,
      creator: user,
      updater: user
    })

    const result = await projectRepo.save({
      name: project.name,
      buildingComplex: newBuildingComplex,
      domain,
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Project, { description: '프로젝트 업데이트' })
  async updateProject(@Arg('project') project: ProjectPatch, @Ctx() context: ResolverContext): Promise<Project> {
    const { user, tx } = context.state
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)
    const buildingRepo = tx.getRepository(Building)
    const buildingLevelRepo = tx.getRepository(BuildingLevel)

    const buildingComplex = project.buildingComplex
    const buildings = project.buildingComplex?.buildings || []

    // 1. 프로젝트 수정
    const projectState = project.totalProgress == 100 ? ProjectState.COMPLETED : ProjectState.ONGOING
    const projectResult = await projectRepo.save({ ...project, state: projectState, updater: user })

    // 2. 단지 정보 수정
    await buildingComplexRepo.save({ ...buildingComplex, updater: user })

    // 2-1. 프로젝트 메인 이미지 첨부파일 나머지 삭제 후 저장
    await createAttachmentAfterDelete(context, project?.mainPhotoUpload, project.id, Project.name)

    // 2-2. 단지 BIM 이미지 첨부파일 나머지 삭제 후 저장
    await createAttachmentAfterDelete(context, buildingComplex?.drawingUpload, buildingComplex.id, BuildingComplex.name + '_bim')

    // 3. 동의 층 정보가 바뀌었으면 층 초기화 후 다시 생성
    const originBuilding = await buildingRepo.findBy({ buildingComplex: { id: buildingComplex.id } }) // 이전 동 정보 가져오기
    const afterBuilding = buildings.reduce((acc, building) => ({ ...acc, [building.name]: building.floorCount }), {}) // 비교용으로 수정된 동 정보 데이터 파싱
    const isBuidlingChanged = originBuilding.some(building => afterBuilding[building.name] !== building.floorCount) // 층 개수가 달라진 동이 있는지 확인

    // 동의 층 개수가 달라지면 모든 층의 데이터 제거 후 생성
    if (isBuidlingChanged || originBuilding.length !== buildings.length) {
      // 3-1. 기존 동/층 첨부파일 및 데이터 제거
      const buildingIds = originBuilding.map((building: Building) => building.id)
      const buildingLevels = await buildingLevelRepo.findBy({ building: { id: In(buildingIds) } })
      const buildingLevelIds = buildingLevels.map((buildingLevel: BuildingLevel) => buildingLevel.id)

      await buildingLevelRepo.softDelete({ building: { id: In(buildingIds) } })
      await buildingRepo.softDelete({ id: In(buildingIds) })
      await deleteAttachmentsByRef(null, { refBys: [...buildingIds, ...buildingLevelIds] }, context)

      // 3-2. 단지 내 동 정보들 생성
      for (let buildingKey in buildings) {
        const building = buildings[buildingKey]
        const newBuilding = await buildingRepo.save({
          buildingComplex: buildingComplex,
          name: building.name,
          floorCount: building.floorCount,
          creator: user
        })

        // 3-3. 동별로 for문 돌면서 층 데이터 개수대로 생성
        for (let i = 1; i <= building.floorCount; i++) {
          await buildingLevelRepo.save({ building: newBuilding, floor: i, creator: user })
        }
      }
    }

    return projectResult
  }

  @Directive('@transaction')
  @Mutation(returns => Project, { description: '프로젝트 도면 업데이트' })
  async updateProjectPlan(@Arg('project') project: ProjectPatch, @Ctx() context: ResolverContext): Promise<Project> {
    const { user, tx, domain } = context.state
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)
    const buildingRepo = tx.getRepository(Building)
    const buildingLevelRepo = tx.getRepository(BuildingLevel)
    const buildingComplex = project.buildingComplex
    const buildings = project.buildingComplex?.buildings || []

    // 1. 프로젝트 수정 시간 업데이트
    const projectResult = await projectRepo.save({ ...project, updater: user })

    // 2. 단지 축척 정보 수정
    await buildingComplexRepo.save({ ...buildingComplex, updater: user })

    for (let buildingKey in buildings) {
      const building = buildings[buildingKey]

      for (let buildingLevelKey in building.buildingLevels) {
        const buildingLevel = building.buildingLevels[buildingLevelKey]

        // 3. 층별 도면 이미지 저장
        const mainDrawingAttatchment = await createAttachmentAfterDelete(
          context,
          buildingLevel.mainDrawingUpload,
          buildingLevel.id,
          BuildingLevel.name + '_mainDrawing'
        )
        // 첨부된 PDF가 있으면 PDF 파일대로 썸네일 생성
        if (mainDrawingAttatchment) {
          const mainDrawingUpload = await buildingLevel.mainDrawingUpload
          const pdfPath = `/${ATTACHMENT_PATH}/${mainDrawingAttatchment.path}`
          const fileName = mainDrawingUpload.filename.replace('.pdf', '')
          const pngFile = await pdfToImage({ pdfPath, fileName })
          await createAttachmentAfterDelete(context, pngFile, buildingLevel.id, BuildingLevel.name + '_mainDrawing_image')

          const pngThumbnailFile = await pdfToImage({ pdfPath, fileName, defaultViewport: { width: 300, height: 200 } })
          await createAttachmentAfterDelete(
            context,
            pngThumbnailFile,
            buildingLevel.id,
            BuildingLevel.name + '_mainDrawing_thumbnail'
          )
        }

        // 3-1. 입면도 파일 저장
        const elevationDrawingAttatchment = await createAttachmentAfterDelete(
          context,
          buildingLevel.elevationDrawingUpload,
          buildingLevel.id,
          BuildingLevel.name + '_elevationDrawing'
        )
        if (elevationDrawingAttatchment) {
          const elevationDrawingUpload = await buildingLevel.elevationDrawingUpload
          const pdfPath = `/${ATTACHMENT_PATH}/${elevationDrawingAttatchment.path}`
          const fileName = elevationDrawingUpload.filename.replace('.pdf', '')
          const pngThumbnailFile = await pdfToImage({ pdfPath, fileName, defaultViewport: { width: 300, height: 200 } })
          await createAttachmentAfterDelete(
            context,
            pngThumbnailFile,
            buildingLevel.id,
            BuildingLevel.name + '_elevationDrawing_thumbnail'
          )
        }

        // 3-2. 철근배분도 파일 저장
        const rebarDistributionDrawingAttatchment = await createAttachmentAfterDelete(
          context,
          buildingLevel.rebarDistributionDrawingUpload,
          buildingLevel.id,
          BuildingLevel.name + '_rebarDistributionDrawing'
        )
        if (rebarDistributionDrawingAttatchment) {
          const rebarDistributionDrawingUpload = await buildingLevel.rebarDistributionDrawingUpload
          const pdfPath = `/${ATTACHMENT_PATH}/${rebarDistributionDrawingAttatchment.path}`
          const fileName = rebarDistributionDrawingUpload.filename.replace('.pdf', '')
          const pngThumbnailFile = await pdfToImage({ pdfPath, fileName, defaultViewport: { width: 300, height: 200 } })
          await createAttachmentAfterDelete(
            context,
            pngThumbnailFile,
            buildingLevel.id,
            BuildingLevel.name + '_rebarDistributionDrawing_thumbnail'
          )
        }

        // 3-3. 층 업데이트 시간 갱신
        await buildingLevelRepo.save({ ...buildingLevel, updater: user })
      }

      // 4. 동별 도면 이미지 저장
      await createAttachmentAfterDelete(context, building?.drawingUpload, building.id, Building.name)

      // 4-1. 동 업데이트 시간 갱신
      await buildingRepo.save({ ...building, updater: user })
    }

    return projectResult
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: '프로젝트 공정표 업로드' })
  async uploadProjectScheduleTable(
    @Arg('param') param: UploadProjectScheduleTable,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { user, tx } = context.state
    const { projectId, scheduleTable } = param

    // 프로젝트 공정표 파일 업로드
    await createAttachmentAfterDelete(context, scheduleTable, projectId, Project.name + '_schedule_table')

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete Project' })
  async deleteProject(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Project).delete({ domain: { id: domain.id }, id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }
}

export async function createAttachmentAfterDelete(context: ResolverContext, file: any, refBy: any, refType: any) {
  let result = null

  // undefined = 기존 파일 그대로
  if (file === undefined) return result

  // 기존 첨부 파일이 있으면 삭제
  await deleteAttachmentsByRef(null, { refBys: [refBy], refType }, context)

  // 파일이 있으면 생성 (null로 들어올 경우 delete까지만)
  if (file) {
    result = await createAttachment(null, { attachment: { file, refType, refBy } }, context)
  }

  return result
}
