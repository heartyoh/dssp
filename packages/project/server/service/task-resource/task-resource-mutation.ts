import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { TaskResource } from './task-resource'
import { NewTaskResource, TaskResourcePatch } from './task-resource-type'

@Resolver(TaskResource)
export class TaskResourceMutation {
  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => TaskResource, { description: 'To create new TaskResource' })
  async createTaskResource(
    @Arg('taskResource') taskResource: NewTaskResource,
    @Ctx() context: ResolverContext
  ): Promise<TaskResource> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(TaskResource).save({
      ...taskResource,
      domain,
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => TaskResource, { description: 'To modify TaskResource information' })
  async updateTaskResource(
    @Arg('id') id: string,
    @Arg('patch') patch: TaskResourcePatch,
    @Ctx() context: ResolverContext
  ): Promise<TaskResource> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(TaskResource)
    const taskResource = await repository.findOne({
      where: { id }
    })

    const result = await repository.save({
      ...taskResource,
      ...patch,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => [TaskResource], { description: "To modify multiple TaskResources' information" })
  async updateMultipleTaskResource(
    @Arg('patches', type => [TaskResourcePatch]) patches: TaskResourcePatch[],
    @Ctx() context: ResolverContext
  ): Promise<TaskResource[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const taskResourceRepo = tx.getRepository(TaskResource)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await taskResourceRepo.save({
          ...newRecord,
          domain,
          creator: user,
          updater: user
        })

        results.push({ ...result, cuFlag: '+' })
      }
    }

    if (_updateRecords.length > 0) {
      for (let i = 0; i < _updateRecords.length; i++) {
        const updateRecord = _updateRecords[i]
        const taskResource = await taskResourceRepo.findOneBy({ id: updateRecord.id })

        const result = await taskResourceRepo.save({
          ...taskResource,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => Boolean, { description: 'To delete TaskResource' })
  async deleteTaskResource(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(TaskResource).delete({ id })

    return true
  }

  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => Boolean, { description: 'To delete multiple TaskResources' })
  async deleteTaskResources(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(TaskResource).delete({
      id: In(ids)
    })

    return true
  }

  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => Boolean, { description: 'To import multiple TaskResources' })
  async importTaskResources(
    @Arg('taskResources', type => [TaskResourcePatch]) taskResources: TaskResourcePatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      taskResources.map(async (taskResource: TaskResourcePatch) => {
        const createdTaskResource: TaskResource = await tx.getRepository(TaskResource).save({ domain, ...taskResource })
      })
    )

    return true
  }
}
