import { Resolver, Query, FieldResolver, Root, Args, Ctx } from 'type-graphql'
import { getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ConstructionDetailType } from './construction-detail-type'
import { ConstructionDetailTypeList } from './construction-detail-type-type'

@Resolver(ConstructionDetailType)
export class ConstructionDetailTypeQuery {
  @Query(returns => ConstructionDetailTypeList, { description: 'To fetch multiple ConstructionDetailTypes' })
  async constructionDetailTypes(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ConstructionDetailTypeList> {
    const queryBuilder = getQueryBuilderFromListParams({
      params,
      repository: await getRepository(ConstructionDetailType),
      searchables: ['name']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => User)
  async updater(@Root() constructionDetailType: ConstructionDetailType): Promise<User> {
    return await getRepository(User).findOneBy({ id: constructionDetailType.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() constructionDetailType: ConstructionDetailType): Promise<User> {
    return await getRepository(User).findOneBy({ id: constructionDetailType.creatorId })
  }
}
