import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Resource } from './resource'
import { ResourceList } from './resource-type'

@Resolver(Resource)
export class ResourceQuery {
  @Query(returns => Resource!, { nullable: true, description: 'To fetch a Resource' })
  async resource(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Resource> {
    const { domain } = context.state

    return await getRepository(Resource).findOne({
      where: { id }
    })
  }

  @Query(returns => ResourceList, { description: 'To fetch multiple Resources' })
  async resources(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ResourceList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(Resource),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() resource: Resource): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: Resource.name,
        refBy: resource.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => User)
  async updater(@Root() resource: Resource): Promise<User> {
    return await getRepository(User).findOneBy({ id: resource.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() resource: Resource): Promise<User> {
    return await getRepository(User).findOneBy({ id: resource.creatorId })
  }
}
