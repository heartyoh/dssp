import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { Checklist } from './checklist'
import { NewChecklist, ChecklistPatch } from './checklist-type'

@Resolver(Checklist)
export class ChecklistMutation {
  @Directive('@transaction')
  @Mutation(returns => Checklist, { description: 'To create new Checklist' })
  async createChecklist(@Arg('checklist') checklist: NewChecklist, @Ctx() context: ResolverContext): Promise<Checklist> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(Checklist).save({
      ...checklist,
      domain,
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Checklist, { description: 'To modify Checklist information' })
  async updateChecklist(
    @Arg('id') id: string,
    @Arg('patch') patch: ChecklistPatch,
    @Ctx() context: ResolverContext
  ): Promise<Checklist> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(Checklist)
    const checklist = await repository.findOne({
      where: { id }
    })

    const result = await repository.save({
      ...checklist,
      ...patch,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [Checklist], { description: "To modify multiple Checklists' information" })
  async updateMultipleChecklist(
    @Arg('patches', type => [ChecklistPatch]) patches: ChecklistPatch[],
    @Ctx() context: ResolverContext
  ): Promise<Checklist[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const checklistRepo = tx.getRepository(Checklist)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await checklistRepo.save({
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
        const checklist = await checklistRepo.findOneBy({ id: updateRecord.id })

        const result = await checklistRepo.save({
          ...checklist,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple Checklists' })
  async deleteChecklists(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Checklist).softDelete({
      id: In(ids)
    })

    return true
  }
}
