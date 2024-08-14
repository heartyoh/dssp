import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { ChecklistTemplateItem } from './checklist-template-item'
import { NewChecklistTemplateItem, ChecklistTemplateItemPatch } from './checklist-template-item-type'

@Resolver(ChecklistTemplateItem)
export class ChecklistTemplateItemMutation {
  @Directive('@transaction')
  @Mutation(returns => ChecklistTemplateItem, { description: 'To create new ChecklistTemplateItem' })
  async createChecklistTemplateItem(
    @Arg('checklistTemplateItem') checklistTemplateItem: NewChecklistTemplateItem,
    @Ctx() context: ResolverContext
  ): Promise<ChecklistTemplateItem> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(ChecklistTemplateItem).save({
      ...checklistTemplateItem,
      domain,
      creator: user,
      updater: user
    })

    if (checklistTemplateItem.thumbnail) {
      await createAttachment(
        null,
        {
          attachment: {
            file: checklistTemplateItem.thumbnail,
            refType: ChecklistTemplateItem.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => ChecklistTemplateItem, { description: 'To modify ChecklistTemplateItem information' })
  async updateChecklistTemplateItem(
    @Arg('id') id: string,
    @Arg('patch') patch: ChecklistTemplateItemPatch,
    @Ctx() context: ResolverContext
  ): Promise<ChecklistTemplateItem> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(ChecklistTemplateItem)
    const checklistTemplateItem = await repository.findOne({
      where: { id }
    })

    const result = await repository.save({
      ...checklistTemplateItem,
      ...patch,
      updater: user
    })

    if (patch.thumbnail) {
      await deleteAttachmentsByRef(null, { refBys: [result.id] }, context)
      await createAttachment(
        null,
        {
          attachment: {
            file: patch.thumbnail,
            refType: ChecklistTemplateItem.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [ChecklistTemplateItem], { description: "To modify multiple ChecklistTemplateItems' information" })
  async updateMultipleChecklistTemplateItem(
    @Arg('patches', type => [ChecklistTemplateItemPatch]) patches: ChecklistTemplateItemPatch[],
    @Ctx() context: ResolverContext
  ): Promise<ChecklistTemplateItem[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const checklistTemplateItemRepo = tx.getRepository(ChecklistTemplateItem)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await checklistTemplateItemRepo.save({
          ...newRecord,
          domain,
          creator: user,
          updater: user
        })

        if (newRecord.thumbnail) {
          await createAttachment(
            null,
            {
              attachment: {
                file: newRecord.thumbnail,
                refType: ChecklistTemplateItem.name,
                refBy: result.id
              }
            },
            context
          )
        }

        results.push({ ...result, cuFlag: '+' })
      }
    }

    if (_updateRecords.length > 0) {
      for (let i = 0; i < _updateRecords.length; i++) {
        const updateRecord = _updateRecords[i]
        const checklistTemplateItem = await checklistTemplateItemRepo.findOneBy({ id: updateRecord.id })

        const result = await checklistTemplateItemRepo.save({
          ...checklistTemplateItem,
          ...updateRecord,
          updater: user
        })

        if (updateRecord.thumbnail) {
          await deleteAttachmentsByRef(null, { refBys: [result.id] }, context)
          await createAttachment(
            null,
            {
              attachment: {
                file: updateRecord.thumbnail,
                refType: ChecklistTemplateItem.name,
                refBy: result.id
              }
            },
            context
          )
        }

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete ChecklistTemplateItem' })
  async deleteChecklistTemplateItem(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ChecklistTemplateItem).delete({ id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple ChecklistTemplateItems' })
  async deleteChecklistTemplateItems(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ChecklistTemplateItem).delete({
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }
}
