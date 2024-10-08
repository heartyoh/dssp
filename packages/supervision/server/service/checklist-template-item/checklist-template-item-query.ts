import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx } from 'type-graphql'
import { getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistTemplateItem } from './checklist-template-item'
import { ChecklistTemplateItemList } from './checklist-template-item-type'
import { ChecklistType } from '../checklist-type/checklist-type'

@Resolver(ChecklistTemplateItem)
export class ChecklistTemplateItemQuery {
  @Query(returns => ChecklistTemplateItem!, { nullable: true, description: 'To fetch a ChecklistTemplateItem' })
  async checklistTemplateItem(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<ChecklistTemplateItem> {
    return await getRepository(ChecklistTemplateItem).findOne({
      where: { id }
    })
  }

  @Query(returns => ChecklistTemplateItemList, { description: 'To fetch multiple ChecklistTemplateItems' })
  async checklistTemplateItems(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ChecklistTemplateItemList> {
    const queryBuilder = getQueryBuilderFromListParams({
      params,
      repository: await getRepository(ChecklistTemplateItem),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async detailTypeName(@Root() checklistTemplateItem: ChecklistTemplateItem): Promise<string> {
    return (await getRepository(ChecklistType).findOneBy({ id: checklistTemplateItem.detailType }))?.detailType || ''
  }

  @FieldResolver(type => User)
  async updater(@Root() checklistTemplateItem: ChecklistTemplateItem): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistTemplateItem.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() checklistTemplateItem: ChecklistTemplateItem): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistTemplateItem.creatorId })
  }
}
