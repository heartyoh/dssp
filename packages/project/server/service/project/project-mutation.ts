import { Resolver, Mutation, Arg, Args, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { Project } from './project'
import { ProjectPatch } from './project-type'
import { BuildingComplex, Building } from '@dssp/building-complex/server'

@Resolver(Project)
export class ProjectMutation {
  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To Send Tax Invoices By Api' })
  async createProject(@Args() params: ProjectPatch, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, user, tx } = context.state
    const { project, buildingComplex, buildings } = params
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)
    const buildingRepo = tx.getRepository(Building)

    console.log(123123123)

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

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple Projects' })
  async deleteProjects(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Project).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple Projects' })
  async importProjects(
    @Arg('projects', type => [ProjectPatch]) projects: ProjectPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      projects.map(async (project: ProjectPatch) => {
        const createdProject: Project = await tx.getRepository(Project).save({ domain, ...project })
      })
    )

    return true
  }
}
