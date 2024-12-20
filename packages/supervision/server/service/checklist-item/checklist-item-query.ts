import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistItem } from './checklist-item'
import { ChecklistItemList } from './checklist-item-type'
import { ChecklistItemComment } from '../checklist-item-comment/checklist-item-comment'
import { BuildingInspection } from '../building-inspection/building-inspection'

@Resolver(ChecklistItem)
export class ChecklistItemQuery {
  @Query(returns => ChecklistItem!, { nullable: true, description: 'To fetch a ChecklistItem' })
  async checklistItem(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<ChecklistItem> {
    return await getRepository(ChecklistItem).findOne({
      where: { id }
    })
  }

  @Query(returns => ChecklistItemList, { description: 'To fetch multiple ChecklistItems' })
  async checklistItems(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ChecklistItemList> {
    const queryBuilder = getQueryBuilderFromListParams({
      params,
      repository: await getRepository(ChecklistItem),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @Query(returns => BuildingInspection, { description: 'BuildingInspection By ChecklistItemId' })
  async inspectionByChecklistItemId(checklistItemId: string): Promise<BuildingInspection> {
    return getRepository(BuildingInspection)
      .createQueryBuilder('bi')
      .innerJoin('checklists', 'c', 'bi.checklist_id = c.id')
      .innerJoin('checklist_items', 'ci', 'c.id = ci.checklist_id')
      .where('ci.id = :checklistItemId', { checklistItemId })
      .getOne()
  }

  @FieldResolver(type => [ChecklistItemComment])
  async checklistItemComments(@Root() checklistItem: ChecklistItem): Promise<ChecklistItemComment[]> {
    return await getRepository(ChecklistItemComment).findBy({ checklistItem: { id: checklistItem.id } })
  }

  @FieldResolver(type => Number)
  async checklistItemCommentCount(@Root() checklistItem: ChecklistItem): Promise<number> {
    return await getRepository(ChecklistItemComment).countBy({ checklistItem: { id: checklistItem.id } })
  }

  @FieldResolver(type => [Attachment])
  async checklistItemAttachments(@Root() checklistItem: ChecklistItem): Promise<Attachment[]> {
    return await getRepository(Attachment).find({
      where: {
        refType: ChecklistItem.name,
        refBy: checklistItem.id
      },
      order: {
        createdAt: 'DESC'
      }
    })
  }

  @FieldResolver(type => Number)
  async checklistItemAttachmentCount(@Root() checklistItem: ChecklistItem): Promise<number> {
    return await getRepository(Attachment).count({
      where: {
        refType: ChecklistItem.name,
        refBy: checklistItem.id
      }
    })
  }

  @FieldResolver(type => User)
  async updater(@Root() checklistItem: ChecklistItem): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistItem.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() checklistItem: ChecklistItem): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistItem.creatorId })
  }
}
