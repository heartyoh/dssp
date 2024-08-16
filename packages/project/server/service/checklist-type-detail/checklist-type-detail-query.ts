import { Resolver, Query, FieldResolver, Root, Args, Ctx } from 'type-graphql'
import { getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistTypeDetail } from './checklist-type-detail'
import { ChecklistTypeDetailList } from './checklist-type-detail-type'

@Resolver(ChecklistTypeDetail)
export class ChecklistTypeDetailQuery {
  @Query(returns => ChecklistTypeDetailList, { description: 'To fetch multiple ChecklistTypeDetails' })
  async checklistTypeDetails(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ChecklistTypeDetailList> {
    const queryBuilder = getQueryBuilderFromListParams({
      params,
      repository: await getRepository(ChecklistTypeDetail),
      searchables: ['name']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => User)
  async updater(@Root() checklistTypeDetail: ChecklistTypeDetail): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistTypeDetail.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() checklistTypeDetail: ChecklistTypeDetail): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistTypeDetail.creatorId })
  }
}
