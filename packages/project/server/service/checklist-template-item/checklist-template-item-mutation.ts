import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { ChecklistTemplateItem } from './checklist-template-item'
import { ChecklistTemplateItemPatch } from './checklist-template-item-type'

@Resolver(ChecklistTemplateItem)
export class ChecklistTemplateItemMutation {
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

    return true
  }
}
