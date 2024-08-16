import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { ChecklistTypeDetail } from './checklist-type-detail'
import { ChecklistTypeDetailPatch } from './checklist-type-detail-type'
import { ChecklistType } from '../checklist-type/checklist-type'

@Resolver(ChecklistTypeDetail)
export class ChecklistTypeDetailMutation {
  @Directive('@transaction')
  @Mutation(returns => [ChecklistTypeDetail], { description: "To modify multiple ChecklistTypeDetails' information" })
  async updateMultipleChecklistTypeDetail(
    @Arg('patches', type => [ChecklistTypeDetailPatch]) patches: ChecklistTypeDetailPatch[],
    @Arg('checklistTypeId') checklistTypeId: string,
    @Ctx() context: ResolverContext
  ): Promise<ChecklistTypeDetail[]> {
    const { domain, user, tx } = context.state

    let results = []
    const checklistTypeDetailRepo = tx.getRepository(ChecklistTypeDetail)
    const checklistType = await tx.getRepository(ChecklistType).findOneBy({ id: checklistTypeId })

    await checklistTypeDetailRepo.delete({ checklistType: { id: checklistTypeId } })

    for (let i = 0; i < patches.length; i++) {
      const result = await checklistTypeDetailRepo.save({
        ...patches[i],
        sequence: i,
        checklistType,
        creator: user,
        updater: user
      })

      results.push({ ...result, cuFlag: '+' })
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple ChecklistTypeDetails' })
  async deleteChecklistTypeDetails(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ChecklistTypeDetail).delete({
      id: In(ids)
    })

    return true
  }
}
