import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { ConstructionType } from './construction-type'
import { ConstructionTypePatch } from './construction-type-type'

@Resolver(ConstructionType)
export class ConstructionTypeMutation {
  @Directive('@transaction')
  @Mutation(returns => [ConstructionType], { description: "To modify multiple ConstructionTypes' information" })
  async updateMultipleConstructionType(
    @Arg('patches', type => [ConstructionTypePatch]) patches: ConstructionTypePatch[],
    @Ctx() context: ResolverContext
  ): Promise<ConstructionType[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const constructionTypeRepo = tx.getRepository(ConstructionType)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await constructionTypeRepo.save({
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
        const constructionType = await constructionTypeRepo.findOneBy({ id: updateRecord.id })

        const result = await constructionTypeRepo.save({
          ...constructionType,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple ConstructionTypes' })
  async deleteConstructionTypes(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ConstructionType).softDelete({
      domain: { id: domain.id },
      id: In(ids)
    })

    return true
  }
}
