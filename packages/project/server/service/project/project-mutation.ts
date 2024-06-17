import { Resolver, Mutation, Arg, Args, Ctx, Directive } from 'type-graphql'
import { In, Not } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { Project } from './project'
import { NewProject, ProjectPatch } from './project-type'
import { BuildingComplex, Building, BuildingLevel } from '@dssp/building-complex'

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
    const projectResult = await projectRepo.save({ ...project, updater: user })

    // 2. 단지 정보 수정
    await buildingComplexRepo.save({ ...buildingComplex, updater: user })

    // 2-1. 프로젝트 메인 이미지 첨부파일 나머지 삭제 후 저장 (null로 오면 삭제만)
    if (project.mainPhotoUpload !== undefined) {
      await deleteAttachmentsByRef(null, { refBys: [project.id] }, context)

      if (project.mainPhotoUpload) {
        await createAttachment(
          null,
          {
            attachment: {
              file: project.mainPhotoUpload,
              refType: Project.name,
              refBy: project.id
            }
          },
          context
        )
      }
    }

    // 2-2. 단지 BIM 이미지 첨부파일 나머지 삭제 후 저장 (null로 오면 삭제만)
    if (buildingComplex.drawingUpload !== undefined) {
      await deleteAttachmentsByRef(null, { refBys: [buildingComplex.id] }, context)

      if (buildingComplex.drawingUpload) {
        await createAttachment(
          null,
          {
            attachment: {
              file: buildingComplex.drawingUpload,
              refType: BuildingComplex.name,
              refBy: buildingComplex.id
            }
          },
          context
        )
      }
    }

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

      buildings.forEach(async (building: Building) => {
        // 3-2. 단지 내 동 정보들 생성
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
      })
    }

    return projectResult
  }

  @Directive('@transaction')
  @Mutation(returns => Project, { description: '프로젝트 도면 업데이트' })
  async updateProjectPlan(@Arg('project') project: ProjectPatch, @Ctx() context: ResolverContext): Promise<Project> {
    const { user, tx } = context.state
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)
    const buildingComplex = project.buildingComplex
    const buildings: Building[] = project.buildingComplex?.buildings || []

    // 1. 프로젝트 수정 시간 업데이트
    const projectResult = await projectRepo.save({ ...project, updater: user })

    // 2. 단지 축척 정보 수정
    await buildingComplexRepo.save({ ...buildingComplex, updater: user })

    for (let buildingKey in buildings) {
      const building = buildings[buildingKey]

      for (let buildingLevelKey in building.buildingLevels) {
        const buildingLevel = building.buildingLevels[buildingLevelKey]

        // 3. 층별 도면 이미지 저장 (null로 오면 삭제만)
        if (buildingLevel?.mainDrawingUpload !== undefined) {
          await deleteAttachmentsByRef(null, { refBys: [buildingLevel.id] }, context)

          if (buildingLevel?.mainDrawingUpload) {
            await createAttachment(
              null,
              {
                attachment: {
                  file: buildingLevel.mainDrawingUpload,
                  refType: BuildingLevel.name,
                  refBy: buildingLevel.id
                }
              },
              context
            )
          }
        }
      }

      // 4. 동별 도면 이미지 저장 (null로 오면 삭제만)
      if (building?.drawingUpload !== undefined) {
        await deleteAttachmentsByRef(null, { refBys: [building.id] }, context)

        if (building?.drawingUpload) {
          await createAttachment(
            null,
            {
              attachment: {
                file: building.drawingUpload,
                refType: Building.name,
                refBy: building.id
              }
            },
            context
          )
        }
      }
    }

    return projectResult
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
