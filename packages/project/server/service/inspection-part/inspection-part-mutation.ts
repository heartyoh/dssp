import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { getRepository } from '@things-factory/shell'
import { InspectionPart } from './inspection-part'
import { InspectionPartPatch } from './inspection-part-type'
import { InspectionDrawingType } from '../inspection-drawing-type/inspection-drawing-type'

@Resolver(InspectionPart)
export class InspectionPartMutation {
  @Directive('@transaction')
  @Mutation(returns => [InspectionPart], { description: "To modify multiple InspectionParts' information" })
  async updateMultipleInspectionPart(
    @Arg('patches', type => [InspectionPartPatch]) patches: InspectionPartPatch[],
    @Arg('inspectionDrawingTypeId') inspectionDrawingTypeId: string,
    @Ctx() context: ResolverContext
  ): Promise<InspectionPart[]> {
    const { user, tx } = context.state

    let results = []

    const inspectionPartRepo = tx.getRepository(InspectionPart)
    const inspectionDrawingType = await tx.getRepository(InspectionDrawingType).findOneBy({ id: inspectionDrawingTypeId })

    await inspectionPartRepo.delete({ inspectionDrawingType: { id: inspectionDrawingTypeId } })

    for (let i = 0; i < patches.length; i++) {
      const result = await inspectionPartRepo.save({
        ...patches[i],
        sequence: i,
        inspectionDrawingType,
        creator: user,
        updater: user
      })

      results.push({ ...result, cuFlag: '+' })
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple InspectionParts' })
  async deleteInspectionParts(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await getRepository(InspectionPart, tx).delete({
      id: In(ids)
    })

    return true
  }
}
