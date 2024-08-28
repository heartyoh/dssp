import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Resource } from './resource'
import { ResourceList } from './resource-type'

@Resolver(Resource)
export class ResourceQuery {
  @Directive('@privilege(category: "project", privilege: "query", domainOwnerGranted: true)')
  @Query(returns => Resource!, { nullable: true, description: 'To fetch a Resource' })
  async resource(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Resource> {
    const { domain } = context.state

    return await getRepository(Resource).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Directive('@privilege(category: "project", privilege: "query", domainOwnerGranted: true)')
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

  @FieldResolver(type => Domain)
  async domain(@Root() resource: Resource): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: resource.domainId })
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
