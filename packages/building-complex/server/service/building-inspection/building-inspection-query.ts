import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingInspection } from './building-inspection'
import { BuildingInspectionList } from './building-inspection-type'

@Resolver(BuildingInspection)
export class BuildingInspectionQuery {
  @Query(returns => BuildingInspection!, { nullable: true, description: 'To fetch a BuildingInspection' })
  async buildingInspection(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<BuildingInspection> {
    const { domain } = context.state

    return await getRepository(BuildingInspection).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => BuildingInspectionList, { description: 'To fetch multiple BuildingInspections' })
  async buildingInspections(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<BuildingInspectionList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(BuildingInspection),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() buildingInspection: BuildingInspection): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        domain: { id: buildingInspection.domainId },
        refType: BuildingInspection.name,
        refBy: buildingInspection.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => Domain)
  async domain(@Root() buildingInspection: BuildingInspection): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: buildingInspection.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() buildingInspection: BuildingInspection): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingInspection.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() buildingInspection: BuildingInspection): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingInspection.creatorId })
  }
}
