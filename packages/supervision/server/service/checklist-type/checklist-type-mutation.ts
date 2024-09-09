import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { ChecklistType } from './checklist-type'
import { ChecklistTypePatch } from './checklist-type-type'

@Resolver(ChecklistType)
export class ChecklistTypeMutation {
  @Directive('@transaction')
  @Mutation(returns => [ChecklistType], { description: "To modify multiple ChecklistTypes' information" })
  async updateMultipleChecklistType(
    @Arg('patches', type => [ChecklistTypePatch]) patches: ChecklistTypePatch[],
    @Ctx() context: ResolverContext
  ): Promise<ChecklistType[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const checklistTypeRepo = tx.getRepository(ChecklistType)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await checklistTypeRepo.save({
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
        const checklistType = await checklistTypeRepo.findOneBy({ id: updateRecord.id })

        const result = await checklistTypeRepo.save({
          ...checklistType,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple ChecklistTypes' })
  async deleteChecklistTypes(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ChecklistType).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    return true
  }
}
