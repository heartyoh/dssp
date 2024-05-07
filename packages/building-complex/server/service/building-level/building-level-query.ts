import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingLevel } from './building-level'
import { BuildingLevelList } from './building-level-type'

@Resolver(BuildingLevel)
export class BuildingLevelQuery {
  @Query(returns => BuildingLevel!, { nullable: true, description: 'To fetch a BuildingLevel' })
  async buildingLevel(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<BuildingLevel> {
    const { domain } = context.state

    return await getRepository(BuildingLevel).findOne({
      where: { id }
    })
  }

  @Query(returns => BuildingLevelList, { description: 'To fetch multiple BuildingLevels' })
  async buildingLevels(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<BuildingLevelList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(BuildingLevel),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() buildingLevel: BuildingLevel): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name,
        refBy: buildingLevel.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => User)
  async updater(@Root() buildingLevel: BuildingLevel): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingLevel.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() buildingLevel: BuildingLevel): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingLevel.creatorId })
  }
}
