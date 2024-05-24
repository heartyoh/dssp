import { Resolver, Mutation, Arg, Args, Ctx, Directive } from 'type-graphql'
import { In, Not } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { Project } from './project'
import { NewProject, ProjectPatch } from './project-type'
import { BuildingComplex, Building, BuildingComplexPatch, BuildingPatch } from '@dssp/building-complex'

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
  async updateProject(
    @Arg('project') project: ProjectPatch,
    @Arg('buildingComplex', type => BuildingComplexPatch) buildingComplex: BuildingComplexPatch,
    @Arg('buildings', type => [BuildingPatch]) buildings: BuildingPatch[],
    @Ctx() context: ResolverContext
  ): Promise<Project> {
    const { user, tx } = context.state
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)
    const buildingRepo = tx.getRepository(Building)

    // 1. 프로젝트 수정
    const projectResult = await projectRepo.save({ ...project, updater: user })

    // 2. 단지 정보 수정
    const buildingComplexResult = await buildingComplexRepo.save({ ...buildingComplex, updater: user })

    // 3. 단지 내 동 정보들 수정
    buildings.forEach(async building => {
      const buildingsResult = await buildingRepo.save({
        buildingComplex: { id: buildingComplex.id },
        ...building,
        updater: user
      })
    })

    // 4. 현재 업데이트 된 동을 제외한 사용되지 않을 동들을 조회하여 제거
    // 4-1. 업데이트 된 동 아이디 추출
    const updatedBuildingIds = buildings.map(building => building.id)

    // 4-2. 기존 동 중에 사용되지 않은 동들 아이디 추출
    const excludedBuildingIds = await buildingRepo
      .createQueryBuilder('b')
      .where('b.building_complex_id = :buildingComplexId', { buildingComplexId: buildingComplex.id })
      .andWhere('b.id NOT IN (:...updatedBuildingIds)', { updatedBuildingIds })
      .getMany()

    // 4-3. 사용 안된 동들 삭제
    if (excludedBuildingIds.length > 0) {
      const ids = excludedBuildingIds.map(building => building.id)
      await buildingRepo.softDelete({ id: In(ids) })
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
