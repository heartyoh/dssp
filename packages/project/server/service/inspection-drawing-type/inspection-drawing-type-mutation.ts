import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { getRepository } from '@things-factory/shell'
import { InspectionDrawingType } from './inspection-drawing-type'
import { InspectionDrawingTypePatch } from './inspection-drawing-type-type'

@Resolver(InspectionDrawingType)
export class InspectionDrawingTypeMutation {
  @Directive('@transaction')
  @Mutation(returns => [InspectionDrawingType], { description: "To modify multiple InspectionDrawingTypes' information" })
  async updateMultipleInspectionDrawingType(
    @Arg('patches', type => [InspectionDrawingTypePatch]) patches: InspectionDrawingTypePatch[],
    @Ctx() context: ResolverContext
  ): Promise<InspectionDrawingType[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const inspectionDrawingTypeRepo = getRepository(InspectionDrawingType, tx)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await inspectionDrawingTypeRepo.save({
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
        const inspectionDrawingType = await inspectionDrawingTypeRepo.findOneBy({ id: updateRecord.id })

        const result = await inspectionDrawingTypeRepo.save({
          ...inspectionDrawingType,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple InspectionDrawingTypes' })
  async deleteInspectionDrawingTypes(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await getRepository(InspectionDrawingType, tx).delete({
      id: In(ids)
    })

    return true
  }
}
