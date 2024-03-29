import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Building } from './building'
import { BuildingList } from './building-type'

@Resolver(Building)
export class BuildingQuery {
  @Query(returns => Building!, { nullable: true, description: 'To fetch a Building' })
  async building(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Building> {
    const { domain } = context.state

    return await getRepository(Building).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => BuildingList, { description: 'To fetch multiple Buildings' })
  async buildings(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<BuildingList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(Building),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() building: Building): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        domain: { id: building.domainId },
        refType: Building.name,
        refBy: building.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => Domain)
  async domain(@Root() building: Building): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: building.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() building: Building): Promise<User> {
    return await getRepository(User).findOneBy({ id: building.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() building: Building): Promise<User> {
    return await getRepository(User).findOneBy({ id: building.creatorId })
  }
}
