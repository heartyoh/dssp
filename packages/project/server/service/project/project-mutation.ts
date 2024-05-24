import { Resolver, Mutation, Arg, Args, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

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
    console.log('project :', project)
    console.log('buildingComplex :', buildingComplex)
    console.log('buildings :', buildings)

    const { user, tx } = context.state
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)
    const buildingRepo = tx.getRepository(Building)

    const projectResult = await projectRepo.save({ ...project, updater: user })
    const buildingComplexResult = await buildingComplexRepo.save({ ...buildingComplex, updater: user })

    buildings.forEach(async building => {
      const buildingsResult = await buildingRepo.save({ ...building, updater: user })
    })

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
