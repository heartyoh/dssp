import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Task } from './task'
import { TaskList } from './task-type'

@Resolver(Task)
export class TaskQuery {
  @Query(returns => Task!, { nullable: true, description: 'To fetch a Task' })
  async task(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Task> {
    const { domain } = context.state

    return await getRepository(Task).findOne({
      where: { id }
    })
  }

  @Query(returns => TaskList, { description: 'To fetch multiple Tasks' })
  async tasks(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<TaskList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(Task),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() task: Task): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: Task.name,
        refBy: task.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => User)
  async updater(@Root() task: Task): Promise<User> {
    return await getRepository(User).findOneBy({ id: task.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() task: Task): Promise<User> {
    return await getRepository(User).findOneBy({ id: task.creatorId })
  }
}
