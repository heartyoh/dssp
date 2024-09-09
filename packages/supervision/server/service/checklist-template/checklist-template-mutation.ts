import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { ChecklistTemplate } from './checklist-template'
import { ChecklistTemplatePatch } from './checklist-template-type'

@Resolver(ChecklistTemplate)
export class ChecklistTemplateMutation {
  @Directive('@transaction')
  @Mutation(returns => [ChecklistTemplate], { description: "To modify multiple ChecklistTemplates' information" })
  async updateMultipleChecklistTemplate(
    @Arg('patches', type => [ChecklistTemplatePatch]) patches: ChecklistTemplatePatch[],
    @Ctx() context: ResolverContext
  ): Promise<ChecklistTemplate[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const checklistTemplateRepo = tx.getRepository(ChecklistTemplate)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await checklistTemplateRepo.save({
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
        const checklistTemplate = await checklistTemplateRepo.findOneBy({ id: updateRecord.id })

        const result = await checklistTemplateRepo.save({
          ...checklistTemplate,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple ChecklistTemplates' })
  async deleteChecklistTemplates(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ChecklistTemplate).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    return true
  }
}
