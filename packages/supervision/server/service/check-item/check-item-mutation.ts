import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { CheckItem } from './check-item'
import { NewCheckItem, CheckItemPatch } from './check-item-type'

@Resolver(CheckItem)
export class CheckItemMutation {
  @Directive('@transaction')
  @Mutation(returns => CheckItem, { description: 'To create new CheckItem' })
  async createCheckItem(@Arg('checkItem') checkItem: NewCheckItem, @Ctx() context: ResolverContext): Promise<CheckItem> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(CheckItem).save({
      ...checkItem,
      domain,
      creator: user,
      updater: user
    })

    if (checkItem.thumbnail) {
      await createAttachment(
        null,
        {
          attachment: {
            file: checkItem.thumbnail,
            refType: CheckItem.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => CheckItem, { description: 'To modify CheckItem information' })
  async updateCheckItem(
    @Arg('id') id: string,
    @Arg('patch') patch: CheckItemPatch,
    @Ctx() context: ResolverContext
  ): Promise<CheckItem> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(CheckItem)
    const checkItem = await repository.findOne({
      where: { domain: { id: domain.id }, id }
    })

    const result = await repository.save({
      ...checkItem,
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
            refType: CheckItem.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [CheckItem], { description: "To modify multiple CheckItems' information" })
  async updateMultipleCheckItem(
    @Arg('patches', type => [CheckItemPatch]) patches: CheckItemPatch[],
    @Ctx() context: ResolverContext
  ): Promise<CheckItem[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const checkItemRepo = tx.getRepository(CheckItem)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await checkItemRepo.save({
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
                refType: CheckItem.name,
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
        const checkItem = await checkItemRepo.findOneBy({ id: updateRecord.id })

        const result = await checkItemRepo.save({
          ...checkItem,
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
                refType: CheckItem.name,
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
  @Mutation(returns => Boolean, { description: 'To delete CheckItem' })
  async deleteCheckItem(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(CheckItem).delete({ domain: { id: domain.id }, id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple CheckItems' })
  async deleteCheckItems(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(CheckItem).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple CheckItems' })
  async importCheckItems(
    @Arg('checkItems', type => [CheckItemPatch]) checkItems: CheckItemPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      checkItems.map(async (checkItem: CheckItemPatch) => {
        const createdCheckItem: CheckItem = await tx.getRepository(CheckItem).save({ domain, ...checkItem })
      })
    )

    return true
  }
}
