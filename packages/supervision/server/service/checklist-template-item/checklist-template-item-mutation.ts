import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { ChecklistTemplateItem } from './checklist-template-item'
import { ChecklistTemplateItemPatch } from './checklist-template-item-type'
import { ChecklistTemplate } from '../checklist-template/checklist-template'

@Resolver(ChecklistTemplateItem)
export class ChecklistTemplateItemMutation {
  @Directive('@transaction')
  @Mutation(returns => [ChecklistTemplateItem], { description: "To modify multiple ChecklistTemplateItems' information" })
  async updateMultipleChecklistTemplateItems(
    @Arg('patches', type => [ChecklistTemplateItemPatch]) patches: ChecklistTemplateItemPatch[],
    @Arg('checklistTemplateId') checklistTemplateId: string,
    @Ctx() context: ResolverContext
  ): Promise<ChecklistTemplateItem[]> {
    const { domain, user, tx } = context.state

    let results = []

    const checklistTemplateItemRepo = tx.getRepository(ChecklistTemplateItem)
    const checklistTemplate = await tx.getRepository(ChecklistTemplate).findOneBy({ id: checklistTemplateId })

    await checklistTemplateItemRepo.delete({ checklistTemplate: { id: checklistTemplateId } })

    for (let i = 0; i < patches.length; i++) {
      const result = await checklistTemplateItemRepo.save({
        ...patches[i],
        sequence: i,
        checklistTemplate,
        creator: user,
        updater: user
      })

      results.push({ ...result, cuFlag: '+' })
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
