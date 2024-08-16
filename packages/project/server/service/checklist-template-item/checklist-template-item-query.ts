import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistTemplateItem } from './checklist-template-item'
import { ChecklistTemplateItemList } from './checklist-template-item-type'

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
  async thumbnail(@Root() checklistTemplateItem: ChecklistTemplateItem): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: ChecklistTemplateItem.name,
        refBy: checklistTemplateItem.id
      }
    })

    return attachment?.fullpath
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
