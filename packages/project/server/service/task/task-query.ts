import { Resolver, Query, Field, FieldResolver, ObjectType, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Task, TaskType } from './task'
import { TaskList } from './task-type'
import { TaskResource } from '../task-resource/task-resource'
import { ResourceType } from 'service/resource/resource'

@ObjectType()
export class DigestedResource {
  @Field({ nullable: true, description: '자원 유형' })
  type?: string

  @Field({ nullable: true, description: '할당량' })
  allocated?: number
}

@Resolver(Task)
export class TaskQuery {
  @Directive('@privilege(category: "project", privilege: "query", domainOwnerGranted: true)')
  @Query(returns => Task!, { nullable: true, description: 'Fetch a single Task by its ID' })
  async task(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Task> {
    return await getRepository(Task).findOne({
      where: { id },
      relations: ['parent', 'taskResources']
    })
  }

  @Directive('@privilege(category: "project", privilege: "query", domainOwnerGranted: true)')
  @Query(returns => TaskList, { description: 'Fetch multiple Tasks based on list parameters' })
  async tasks(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<TaskList> {
    const queryBuilder = getQueryBuilderFromListParams({
      params,
      repository: await getRepository(Task),
      alias: 'tasks',
      searchables: ['name', 'code']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  // @FieldResolver(type => Date, { nullable: true, description: 'Calculate or return the start date of the task' })
  // async startDate(@Root() task: Task): Promise<Date | undefined> {
  //   if (task.type === TaskType.TASK) {
  //     return task.startDate
  //   } else {
  //     const children = await getRepository(Task).find({ where: { parent: { id: task.id } } })
  //     return children.reduce(
  //       (earliest, child) => {
  //         if (!earliest || (child.startDate && child.startDate < earliest)) {
  //           return child.startDate
  //         }
  //         return earliest
  //       },
  //       undefined as Date | undefined
  //     )
  //   }
  // }

  // @FieldResolver(type => Date, { nullable: true, description: 'Calculate or return the end date of the task' })
  // async endDate(@Root() task: Task): Promise<Date | undefined> {
  //   if (task.type === TaskType.TASK) {
  //     return task.endDate
  //   } else {
  //     const children = await getRepository(Task).find({ where: { parent: { id: task.id } } })
  //     return children.reduce(
  //       (latest, child) => {
  //         if (!latest || (child.endDate && child.endDate > latest)) {
  //           return child.endDate
  //         }
  //         return latest
  //       },
  //       undefined as Date | undefined
  //     )
  //   }
  // }

  // @FieldResolver(type => Number, { nullable: true, description: 'Calculate the duration of the task in days' })
  // async duration(@Root() task: Task): Promise<number | undefined> {
  //   if (task.type === TaskType.TASK) {
  //     return task.duration
  //   } else {
  //     const startDate = await this.startDate(task)
  //     const endDate = await this.endDate(task)

  //     if (startDate && endDate) {
  //       const durationInMs = endDate.getTime() - startDate.getTime()
  //       const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24))
  //       return durationInDays
  //     }

  //     return
  //   }
  // }

  @FieldResolver(type => String, { nullable: true, description: 'Calculate the duration of the task in days' })
  async length(@Root() task: Task): Promise<string | undefined> {
    // if (task.type === TaskType.TASK) {
    return `${task.duration || 1}d`
    // } else {
    //   const startDate = await this.startDate(task)
    //   const endDate = await this.endDate(task)

    //   if (startDate && endDate) {
    //     const durationInMs = endDate.getTime() - startDate.getTime()
    //     const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24))
    //     return `${durationInDays || 1}d`
    //   }

    //   return
    // }
  }

  @FieldResolver(type => [Task])
  async children(
    @Root() task: Task,
    @Args(type => ListParam) params: ListParam,
    @Ctx() context: ResolverContext
  ): Promise<Task[]> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      params,
      alias: 'tasks',
      repository: await getRepository(Task),
      searchables: ['name', 'code']
    }).andWhere({ parent: { id: task.id } })

    const [items, total] = await queryBuilder.getManyAndCount()

    return items
  }

  @FieldResolver(type => [TaskResource], { description: 'Return the list of resources allocated to the task' })
  async taskResources(@Root() task: Task): Promise<TaskResource[]> {
    return task?.id && (await getRepository(TaskResource).find({ where: { task: { id: task.id } } }))
  }

  @FieldResolver(type => [DigestedResource], { description: 'Return the simple list of resources allocated to the task' })
  async resources(@Root() task: Task): Promise<DigestedResource[]> {
    const taskResources =
      task?.id &&
      (await getRepository(TaskResource).find({
        where: {
          task: { id: task.id }
        },
        relations: ['resource']
      }))

    return (taskResources || []).map(taskResource => {
      return {
        type: taskResource.resource.name,
        allocated: taskResource.quantity
      }
    })
  }

  @FieldResolver(type => User, { description: 'Fetch the user who last updated the task' })
  async updater(@Root() task: Task): Promise<User> {
    return await getRepository(User).findOneBy({ id: task.updaterId })
  }

  @FieldResolver(type => User, { description: 'Fetch the user who created the task' })
  async creator(@Root() task: Task): Promise<User> {
    return await getRepository(User).findOneBy({ id: task.creatorId })
  }
}
