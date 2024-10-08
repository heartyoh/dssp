import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { Task } from './task'
import { NewTask, TaskPatch } from './task-type'

@Resolver(Task)
export class TaskMutation {
  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => Task, { description: 'To create new Task' })
  async createTask(@Arg('task') task: NewTask, @Ctx() context: ResolverContext): Promise<Task> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(Task).save({
      ...task,
      domain,
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => Task, { description: 'To modify Task information' })
  async updateTask(@Arg('id') id: string, @Arg('patch') patch: TaskPatch, @Ctx() context: ResolverContext): Promise<Task> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(Task)
    const task = await repository.findOne({
      where: { id }
    })

    const result = await repository.save({
      ...task,
      ...patch,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => [Task], { description: "To modify multiple Tasks' information" })
  async updateMultipleTask(
    @Arg('patches', type => [TaskPatch]) patches: TaskPatch[],
    @Ctx() context: ResolverContext
  ): Promise<Task[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const taskRepo = tx.getRepository(Task)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await taskRepo.save({
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
        const task = await taskRepo.findOneBy({ id: updateRecord.id })

        const result = await taskRepo.save({
          ...task,
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
  @Mutation(returns => Boolean, { description: 'To delete Task' })
  async deleteTask(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Task).delete({ id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => Boolean, { description: 'To delete multiple Tasks' })
  async deleteTasks(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Task).delete({
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Directive('@privilege(category: "project", privilege: "mutation", domainOwnerGranted: true)')
  @Mutation(returns => Boolean, { description: 'To import multiple Tasks' })
  async importTasks(@Arg('tasks', type => [TaskPatch]) tasks: TaskPatch[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      tasks.map(async (task: TaskPatch) => {
        const createdTask: Task = await tx.getRepository(Task).save({ domain, ...task })
      })
    )

    return true
  }
}
