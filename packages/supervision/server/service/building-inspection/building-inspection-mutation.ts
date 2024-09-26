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
    const { user, tx } = context.state
    const buildingInspectionRepository = tx.getRepository(BuildingInspection)
    const checklistRepository = tx.getRepository(Checklist)
    const checklistItemRepository = tx.getRepository(ChecklistItem)
    const { buildingLevelId, checklist, checklistItem } = patch

    // 1. 벨리데이션
    if (!buildingLevelId) throw new Error('층 아이디가 없습니다.')
    if (!checklist.name) throw new Error('체크리스트 이름이 없습니다.')
    if (!checklist.constructionType) throw new Error('공종 타입이 없습니다.')
    if (!checklist.constructionDetailType) throw new Error('상세 공종 타입이 없습니다.')
    if (!checklist.location) throw new Error('위치가 없습니다.')
    if (checklistItem.length === 0) throw new Error('체크리스트 아이템이 없습니다.')

    // 2. checklist 저장
    const savedChecklist = await checklistRepository.save({
      ...checklist,
      creator: user,
      updater: user
    })

    // 3. checklistItem 저장
    const checklistItems = checklistItem.map((item, idx) => ({
      name: item.name,
      mainType: item.mainType,
      detailType: item.detailType,
      sequence: idx,
      checklist: savedChecklist,
      creator: user,
      updater: user
    }))
    await checklistItemRepository.save(checklistItems)

    // 4. buildingInspection 저장
    const result = await buildingInspectionRepository.save({
      status: BuildingInspectionStatus.WAIT,
      buildingLevel: { id: buildingLevelId },
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
