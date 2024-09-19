import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
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
    const checklistItems = patch.checklistItem.map((item, idx) => ({
      name: item.name,
      mainType: item.mainType,
      detailType: item.detailType,
      sequence: idx,
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
      checklist: savedChecklist,
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple Checklists' })
  async deleteBuildingInspections(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state
    const buildingInspectionRepository = tx.getRepository(BuildingInspection)
    const checklistRepository = tx.getRepository(Checklist)
    const checklistItemRepository = tx.getRepository(ChecklistItem)

    // 검측 데이터 제거
    const buildingInspections = await buildingInspectionRepository.createQueryBuilder('bi').whereInIds(ids).getMany()
    await buildingInspectionRepository.softDelete({
      id: In(ids)
    })

    // 검측 데이터의 체크 리스트 제거
    const checklistIds = buildingInspections.map(bi => bi.checklistId)
    await checklistRepository.softDelete({
      id: In(checklistIds)
    })

    // 검측 데이터의 체크 리스트 아이템 제거
    await checklistItemRepository
      .createQueryBuilder()
      .softDelete()
      .where('checklist_id IN (:...checklistIds)', { checklistIds })
      .execute()

    return true
  }
}
