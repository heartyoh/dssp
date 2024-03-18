import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { Project } from './project'
import { NewProject, ProjectPatch } from './project-type'

@Resolver(Project)
export class ProjectMutation {
  @Directive('@transaction')
  @Mutation(returns => Project, { description: 'To create new Project' })
  async createProject(@Arg('project') project: NewProject, @Ctx() context: ResolverContext): Promise<Project> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(Project).save({
      ...project,
      domain,
      creator: user,
      updater: user
    })

    if (project.thumbnail) {
      await createAttachment(
        null,
        {
          attachment: {
            file: project.thumbnail,
            refType: Project.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Project, { description: 'To modify Project information' })
  async updateProject(
    @Arg('id') id: string,
    @Arg('patch') patch: ProjectPatch,
    @Ctx() context: ResolverContext
  ): Promise<Project> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(Project)
    const project = await repository.findOne({
      where: { domain: { id: domain.id }, id }
    })

    const result = await repository.save({
      ...project,
      ...patch,
      updater: user
    })

    if (patch.thumbnail) {
      await deleteAttachmentsByRef(null, { refBys: [result.id] }, context)
      await createAttachment(
        null,
        {
          attachment: {
            file: patch.thumbnail,
            refType: Project.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [Project], { description: "To modify multiple Projects' information" })
  async updateMultipleProject(
    @Arg('patches', type => [ProjectPatch]) patches: ProjectPatch[],
    @Ctx() context: ResolverContext
  ): Promise<Project[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const projectRepo = tx.getRepository(Project)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await projectRepo.save({
          ...newRecord,
          domain,
          creator: user,
          updater: user
        })

        if (newRecord.thumbnail) {
          await createAttachment(
            null,
            {
              attachment: {
                file: newRecord.thumbnail,
                refType: Project.name,
                refBy: result.id
              }
            },
            context
          )
        }

        results.push({ ...result, cuFlag: '+' })
      }
    }

    if (_updateRecords.length > 0) {
      for (let i = 0; i < _updateRecords.length; i++) {
        const updateRecord = _updateRecords[i]
        const project = await projectRepo.findOneBy({ id: updateRecord.id })

        const result = await projectRepo.save({
          ...project,
          ...updateRecord,
          updater: user
        })

        if (updateRecord.thumbnail) {
          await deleteAttachmentsByRef(null, { refBys: [result.id] }, context)
          await createAttachment(
            null,
            {
              attachment: {
                file: updateRecord.thumbnail,
                refType: Project.name,
                refBy: result.id
              }
            },
            context
          )
        }

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
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
  async deleteProjects(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
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
