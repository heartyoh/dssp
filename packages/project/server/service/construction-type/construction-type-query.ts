import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx } from 'type-graphql'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ConstructionType } from './construction-type'
import { ConstructionTypeList } from './construction-type-type'
import { ConstructionDetailType } from '../construction-detail-type/construction-detail-type'

@Resolver(ConstructionType)
export class ConstructionTypeQuery {
  @Query(returns => ConstructionType!, { nullable: true, description: 'To fetch a ConstructionType' })
  async constructionType(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<ConstructionType> {
    const { domain } = context.state

    return await getRepository(ConstructionType).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => ConstructionTypeList, { description: 'To fetch multiple ConstructionTypes' })
  async constructionTypes(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ConstructionTypeList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(ConstructionType)
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => [ConstructionDetailType])
  async constructionDetailTypes(@Root() constructionType: ConstructionType): Promise<ConstructionDetailType[]> {
    return await getRepository(ConstructionDetailType).findBy({ constructionType: { id: constructionType.id } })
  }

  @FieldResolver(type => Domain)
  async domain(@Root() constructionType: ConstructionType): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: constructionType.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() constructionType: ConstructionType): Promise<User> {
    return await getRepository(User).findOneBy({ id: constructionType.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() constructionType: ConstructionType): Promise<User> {
    return await getRepository(User).findOneBy({ id: constructionType.creatorId })
  }
}
