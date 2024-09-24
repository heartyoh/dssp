import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx } from 'type-graphql'
import { getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Checklist } from './checklist'
import { ChecklistList } from './checklist-type'
import { ChecklistItem } from '../checklist-item/checklist-item'

@Resolver(Checklist)
export class ChecklistQuery {
  @Query(returns => Checklist!, { nullable: true, description: 'To fetch a Checklist' })
  async checklist(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Checklist> {
    const { domain } = context.state

    return await getRepository(Checklist).findOne({
      where: { id }
    })
  }

  @Query(returns => ChecklistList, { description: 'To fetch multiple Checklists' })
  async checklists(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ChecklistList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      params,
      repository: await getRepository(Checklist),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => [ChecklistItem])
  async checklistItems(@Root() checklist: Checklist): Promise<ChecklistItem[]> {
    return await getRepository(ChecklistItem)
      .createQueryBuilder('ci')
      .where('ci.checklist_id = :checklistId', { checklistId: checklist.id })
      .orderBy('ci.sequence', 'ASC')
      .getMany()
  }

  @FieldResolver(type => User)
  async updater(@Root() checklist: Checklist): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklist.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() checklist: Checklist): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklist.creatorId })
  }
}
