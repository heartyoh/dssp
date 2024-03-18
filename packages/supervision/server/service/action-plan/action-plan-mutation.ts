import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { ActionPlan } from './action-plan'
import { NewActionPlan, ActionPlanPatch } from './action-plan-type'

@Resolver(ActionPlan)
export class ActionPlanMutation {
  @Directive('@transaction')
  @Mutation(returns => ActionPlan, { description: 'To create new ActionPlan' })
  async createActionPlan(@Arg('actionPlan') actionPlan: NewActionPlan, @Ctx() context: ResolverContext): Promise<ActionPlan> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(ActionPlan).save({
      ...actionPlan,
      domain,
      creator: user,
      updater: user
    })

    if (actionPlan.thumbnail) {
      await createAttachment(
        null,
        {
          attachment: {
            file: actionPlan.thumbnail,
            refType: ActionPlan.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => ActionPlan, { description: 'To modify ActionPlan information' })
  async updateActionPlan(
    @Arg('id') id: string,
    @Arg('patch') patch: ActionPlanPatch,
    @Ctx() context: ResolverContext
  ): Promise<ActionPlan> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(ActionPlan)
    const actionPlan = await repository.findOne({
      where: { domain: { id: domain.id }, id }
    })

    const result = await repository.save({
      ...actionPlan,
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
            refType: ActionPlan.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [ActionPlan], { description: "To modify multiple ActionPlans' information" })
  async updateMultipleActionPlan(
    @Arg('patches', type => [ActionPlanPatch]) patches: ActionPlanPatch[],
    @Ctx() context: ResolverContext
  ): Promise<ActionPlan[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const actionPlanRepo = tx.getRepository(ActionPlan)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await actionPlanRepo.save({
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
                refType: ActionPlan.name,
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
        const actionPlan = await actionPlanRepo.findOneBy({ id: updateRecord.id })

        const result = await actionPlanRepo.save({
          ...actionPlan,
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
                refType: ActionPlan.name,
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
  @Mutation(returns => Boolean, { description: 'To delete ActionPlan' })
  async deleteActionPlan(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ActionPlan).delete({ domain: { id: domain.id }, id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple ActionPlans' })
  async deleteActionPlans(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ActionPlan).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple ActionPlans' })
  async importActionPlans(
    @Arg('actionPlans', type => [ActionPlanPatch]) actionPlans: ActionPlanPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      actionPlans.map(async (actionPlan: ActionPlanPatch) => {
        const createdActionPlan: ActionPlan = await tx.getRepository(ActionPlan).save({ domain, ...actionPlan })
      })
    )

    return true
  }
}
