import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { ChecklistItem } from './checklist-item'
import { NewChecklistItem, ChecklistItemPatch } from './checklist-item-type'

@Resolver(ChecklistItem)
export class ChecklistItemMutation {
  @Directive('@transaction')
  @Mutation(returns => ChecklistItem, { description: 'To create new ChecklistItem' })
  async createChecklistItem(
    @Arg('checklistItem') checklistItem: NewChecklistItem,
    @Ctx() context: ResolverContext
  ): Promise<ChecklistItem> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(ChecklistItem).save({
      ...checklistItem,
      domain,
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => ChecklistItem, { description: 'To modify ChecklistItem information' })
  async updateChecklistItem(
    @Arg('id') id: string,
    @Arg('patch') patch: ChecklistItemPatch,
    @Ctx() context: ResolverContext
  ): Promise<ChecklistItem> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(ChecklistItem)
    const checklistItem = await repository.findOne({
      where: { id }
    })

    const result = await repository.save({
      ...checklistItem,
      ...patch,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [ChecklistItem], { description: "To modify multiple ChecklistItems' information" })
  async updateMultipleChecklistItem(
    @Arg('patches', type => [ChecklistItemPatch]) patches: ChecklistItemPatch[],
    @Ctx() context: ResolverContext
  ): Promise<ChecklistItem[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const checklistItemRepo = tx.getRepository(ChecklistItem)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await checklistItemRepo.save({
          ...newRecord,
          domain,
          creator: user,
          updater: user
        })

        results.push({ ...result, cuFlag: '+' })
      }
    }

    if (_updateRecords.length > 0) {
      for (let i = 0; i < _updateRecords.length; i++) {
        const updateRecord = _updateRecords[i]
        const checklistItem = await checklistItemRepo.findOneBy({ id: updateRecord.id })

        const result = await checklistItemRepo.save({
          ...checklistItem,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete ChecklistItem' })
  async deleteChecklistItem(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ChecklistItem).delete({ id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple ChecklistItems' })
  async deleteChecklistItems(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ChecklistItem).delete({
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple ChecklistItems' })
  async importChecklistItems(
    @Arg('checklistItems', type => [ChecklistItemPatch]) checklistItems: ChecklistItemPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      checklistItems.map(async (checklistItem: ChecklistItemPatch) => {
        const createdChecklistItem: ChecklistItem = await tx.getRepository(ChecklistItem).save({ domain, ...checklistItem })
      })
    )

    return true
  }
}
