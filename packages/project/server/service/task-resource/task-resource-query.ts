import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { TaskResource } from './task-resource'
import { TaskResourceList } from './task-resource-type'

@Resolver(TaskResource)
export class TaskResourceQuery {
  @Query(returns => TaskResource!, { nullable: true, description: 'To fetch a TaskResource' })
  async taskResource(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<TaskResource> {
    const { domain } = context.state

    return await getRepository(TaskResource).findOne({
      where: { id }
    })
  }

  @Query(returns => TaskResourceList, { description: 'To fetch multiple TaskResources' })
  async taskResources(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<TaskResourceList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(TaskResource),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }
}
