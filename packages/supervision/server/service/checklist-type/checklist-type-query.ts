import { Resolver, Query, FieldResolver, Root, Args, Ctx } from 'type-graphql'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistType } from './checklist-type'
import { ChecklistTypeList } from './checklist-type-type'

@Resolver(ChecklistType)
export class ChecklistTypeQuery {
  @Query(returns => ChecklistTypeList, { description: 'To fetch multiple ChecklistTypes' })
  async checklistTypes(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ChecklistTypeList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(ChecklistType),
      searchables: ['name']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => Domain)
  async domain(@Root() checklistType: ChecklistType): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: checklistType.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() checklistType: ChecklistType): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistType.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() checklistType: ChecklistType): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistType.creatorId })
  }
}
