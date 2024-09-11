import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { BuildingInspection } from './building-inspection'
import { NewBuildingInspection } from './building-inspection-type'
import { BuildingInspectionStatus } from './building-inspection'
import { Checklist } from '../checklist/checklist'
import { ChecklistItem } from '../checklist-item/checklist-item'

@Resolver(BuildingInspection)
export class BuildingInspectionMutation {
  @Directive('@transaction')
  @Mutation(returns => BuildingInspection, { description: 'To create Building Inspection information' })
  async createBuildingInspection(
    @Arg('patch') patch: NewBuildingInspection,
    @Ctx() context: ResolverContext
  ): Promise<BuildingInspection> {
    const { domain, user, tx } = context.state

    const buildingInspectionRepository = tx.getRepository(BuildingInspection)
    const checklistRepository = tx.getRepository(Checklist)
    const checklistItemRepository = tx.getRepository(ChecklistItem)

    // 1. checklist 저장
    const savedChecklist = await checklistRepository.save({
      ...patch.checklist,
      creator: user,
      updater: user
    })

    // 2. checklistItem 저장
    const checklistItems = patch.checklistItem.map(item => ({
      name: item.name,
      mainType: item.mainType,
      detailType: item.detailType,
      checklist: savedChecklist,
      creator: user,
      updater: user
    }))
    await checklistItemRepository.save(checklistItems)

    // 3. buildingInspection 저장
    const result = await buildingInspectionRepository.save({
      status: BuildingInspectionStatus.REQUEST,
      buildingLevel: { id: patch.buildingLevelId },
      requestDate: new Date(),
      checklistId: savedChecklist.id,
      creator: user,
      updater: user
    })

    return result
  }
}
