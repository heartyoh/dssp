import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { BuildingInspection } from './building-inspection'
import {
  NewBuildingInspection,
  UpdateBuildingInspectionDrawingMarker,
  UpdateBuildingInspectionSubmitType
} from './building-inspection-type'
import { BuildingInspectionStatus } from './building-inspection'
import { Checklist } from '../checklist/checklist'
import { ChecklistItem } from '../checklist-item/checklist-item'
import { getRepository } from '@things-factory/shell'
import { BuildingLevel } from '@dssp/building-complex'

@Resolver(BuildingInspection)
export class BuildingInspectionMutation {
  @Directive('@transaction')
  @Mutation(returns => BuildingInspection, { description: 'To create Building Inspection information' })
  async createBuildingInspection(
    @Arg('patch') patch: NewBuildingInspection,
    @Ctx() context: ResolverContext
  ): Promise<BuildingInspection> {
    const { user, tx } = context.state
    const { buildingLevelId, checklist, checklistItem } = patch
    const buildingInspectionRepository = tx.getRepository(BuildingInspection)
    const checklistRepository = tx.getRepository(Checklist)
    const checklistItemRepository = tx.getRepository(ChecklistItem)

    // 1. 벨리데이션
    if (!buildingLevelId) throw new Error('층 아이디가 없습니다.')
    if (!checklist.name) throw new Error('체크리스트 이름이 없습니다.')
    if (!checklist.constructionType) throw new Error('공종 타입이 없습니다.')
    if (!checklist.constructionDetailType) throw new Error('상세 공종 타입이 없습니다.')
    if (!checklist.location) throw new Error('위치가 없습니다.')
    if (!checklist.inspectionDrawingType) throw new Error('검측 도면 타입이 없습니다.')
    if (checklist.inspectionParts.length === 0) throw new Error('검측 부위가 없습니다.')
    if (checklistItem.length === 0) throw new Error('체크리스트 아이템이 없습니다.')

    // 2. checklist 저장
    const documentNo = await this.getRecentDocumentNoByBuildingLevelId(buildingLevelId)
    const savedChecklist = await checklistRepository.save({
      ...checklist,
      documentNo,
      creator: user,
      updater: user
    })

    // 3. checklistItem 저장
    const checklistItems = checklistItem.map((item, idx) => ({
      name: item.name,
      mainType: item.mainType,
      detailType: item.detailType,
      inspctionCriteria: item.inspctionCriteria,
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
      checklist: savedChecklist,
      creator: user,
      updater: user
    })

    return result
  }

  // 검측 상태 변경 & 체크리스트 갱신
  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To create Building Inspection And Checklist information' })
  async updateBuildingInspectionChecklist(
    @Arg('buildingInspection') buildingInspection: UpdateBuildingInspectionSubmitType,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { user, tx } = context.state
    const { id: buildingInspectionId, checklist, checklistItem } = buildingInspection
    const buildingInspectionRepo = tx.getRepository(BuildingInspection)
    const checklistRepo = tx.getRepository(Checklist)
    const checklistItemRepo = tx.getRepository(ChecklistItem)
    const oldBuildingInspection = await buildingInspectionRepo.findOneBy({ id: buildingInspectionId })
    const status = oldBuildingInspection.status
    const isConstructor: boolean =
      status == BuildingInspectionStatus.WAIT ||
      status == BuildingInspectionStatus.OVERALL_WAIT ||
      status == BuildingInspectionStatus.FAIL
    let inspectionStatus = null

    // 1. 벨리데이션
    if (!buildingInspectionId) throw new Error('검측 아이디가 없습니다.')
    if (!status) throw new Error('검측 상태가 없습니다.')
    if (status == BuildingInspectionStatus.PASS) throw new Error('검측 상태가 수정할 수 있는 상태가 아닙니다.')

    if (isConstructor) {
      // 시공자 타입별 밸리데이션
      if (checklistItem.length !== checklistItem.filter(v => v.constructionConfirmStatus).length) {
        throw new Error('아이템을 모두 체크해야 합니다.')
      }
      if (status == BuildingInspectionStatus.OVERALL_WAIT && !checklist.overallConstructorSignature) {
        throw new Error('총괄 시공책임자 사인이 없습니다.')
      }
      if (status == BuildingInspectionStatus.WAIT && !checklist.taskConstructorSignature) {
        throw new Error('공종별 시공관리자 사인이 없습니다.')
      }

      // 시공자 상태 데이터
      const isPassed = checklistItem.length === checklistItem.filter(v => v.constructionConfirmStatus === 'T').length

      if (!isPassed) {
        // 1. 검측이 불햡격 = 상태는 불합격으로, 시공자 싸인은 모두 초기화
        inspectionStatus = BuildingInspectionStatus.FAIL
        checklist.overallConstructorSignature = null
        checklist.taskConstructorSignature = null
      } else if (isPassed && (status === BuildingInspectionStatus.WAIT || status === BuildingInspectionStatus.FAIL)) {
        // 2. 검측이 합격이면서 공종 시공자 스탭 = 상태는 총괄 시공자 스탭으로
        inspectionStatus = BuildingInspectionStatus.OVERALL_WAIT
      } else if (isPassed && status === BuildingInspectionStatus.OVERALL_WAIT) {
        // 3. 검측이 합격이면서 총괄 시공자 스탭 = 상태는 공종 감리자 스탭으로, 감리자 싸인은 모두 초기화
        inspectionStatus = BuildingInspectionStatus.REQUEST
        checklist.overallSupervisorySignature = null
        checklist.taskSupervisorySignature = null
      }
    } else {
      // 감리자 타입별 밸리데이션
      if (checklistItem.length !== checklistItem.filter(v => v.supervisoryConfirmStatus).length) {
        throw new Error('아이템을 모두 체크해야 합니다.')
      }
      if (status == BuildingInspectionStatus.OVERALL_REQUEST && !checklist.overallSupervisorySignature) {
        throw new Error('총괄 감리책임자 사인이 없습니다.')
      }
      if (status == BuildingInspectionStatus.REQUEST && !checklist.taskSupervisorySignature) {
        throw new Error('공종별 감리 책임자 사인이 없습니다.')
      }

      // 감리자 상태 데이터
      const isPassed = checklistItem.length === checklistItem.filter(v => v.supervisoryConfirmStatus === 'T').length
      if (!isPassed) {
        // 1. 검측이 불햡격 = 상태는 불합격으로, 시공자 싸인은 모두 초기화
        inspectionStatus = BuildingInspectionStatus.FAIL
        checklist.overallConstructorSignature = null
        checklist.taskConstructorSignature = null
      } else if (isPassed && status === BuildingInspectionStatus.REQUEST) {
        // 2. 검측이 합격이면서 공종 감리자 스탭 = 상태는 총괄 감리자 스탭으로
        inspectionStatus = BuildingInspectionStatus.OVERALL_REQUEST
      } else if (isPassed && status === BuildingInspectionStatus.OVERALL_REQUEST) {
        // 3. 검측이 합격이면서 총괄 감리자 스탭 = 상태는 합격으로
        inspectionStatus = BuildingInspectionStatus.PASS
      }
    }

    // 2. buildingInspection 저장
    await buildingInspectionRepo.save({
      ...oldBuildingInspection,
      status: inspectionStatus,
      updater: user
    })

    // 3. checklist 저장
    const oldChecklist = await checklistRepo.findOneBy({ id: checklist.id })
    const inspectionDateField = isConstructor ? 'constructionInspectionDate' : 'supervisorInspectionDate'
    await checklistRepo.save({
      ...oldChecklist,
      [inspectionDateField]: new Date(),
      overallConstructorSignature: checklist.overallConstructorSignature,
      taskConstructorSignature: checklist.taskConstructorSignature,
      overallSupervisorySignature: checklist.overallSupervisorySignature,
      taskSupervisorySignature: checklist.taskSupervisorySignature,
      updater: user
    })

    // 4. checklistItem 저장
    for (let item of checklistItem) {
      const confirmStatusField = isConstructor ? 'constructionConfirmStatus' : 'supervisoryConfirmStatus'
      await checklistItemRepo.update(item.id, {
        [confirmStatusField]: item[confirmStatusField],
        updater: user
      })
    }

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => BuildingInspection, { description: 'To update Building Inspection information' })
  async updateBuildingInspection(
    @Arg('patch') patch: UpdateBuildingInspectionDrawingMarker,
    @Ctx() context: ResolverContext
  ): Promise<BuildingInspection> {
    const { user, tx } = context.state
    const buildingInspectionRepo = tx.getRepository(BuildingInspection)

    // 벨리데이션
    if (!patch.id) throw new Error('검측 아이디가 없습니다.')

    const buildingInspection = await buildingInspectionRepo.findOneBy({ id: patch.id })

    // 완료 상태인 검측데이터면 삭제 못함
    if (buildingInspection.status === BuildingInspectionStatus.PASS) {
      throw new Error('완료 상태인 검측정보를 변경할 수 없습니다.')
    }

    const result = await buildingInspectionRepo.save({
      ...buildingInspection,
      ...patch,
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
    const { tx } = context.state
    const buildingInspectionRepository = tx.getRepository(BuildingInspection)
    const checklistRepository = tx.getRepository(Checklist)
    const checklistItemRepository = tx.getRepository(ChecklistItem)

    const buildingInspections = await buildingInspectionRepository.createQueryBuilder('bi').whereInIds(ids).getMany()

    // 완료 상태인 검측데이터가 한개라도 있으면 삭제 못함
    if (buildingInspections.filter(bi => bi.status === BuildingInspectionStatus.PASS).length > 0) {
      throw new Error('완료 상태인 검측정보를 변경할 수 없습니다.')
    }

    // 검측 데이터 제거
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

  async getRecentDocumentNoByBuildingLevelId(buildingLevelId: string): Promise<string> {
    const buildingLevel = await getRepository(BuildingLevel).findOne({
      where: { id: buildingLevelId },
      relations: ['building']
    })

    const buildingName = buildingLevel.building.name.match(/\d+/g)?.join('')?.padStart(4, '0') || '0000'
    const floorName = buildingLevel.floor.toString().padStart(3, '0')
    const latestChecklist = await getRepository(Checklist)
      .createQueryBuilder('c')
      .where('c.document_no LIKE :pattern', { pattern: `${buildingName}-${floorName}-%` })
      .orderBy('c.created_at', 'DESC')
      .getOne()

    let documentNo = '000001'
    if (latestChecklist) {
      const lastNo = latestChecklist.documentNo.split('-')[2]
      documentNo = (Number(lastNo) + 1).toString().padStart(6, '0')
    }

    return `${buildingName}-${floorName}-${documentNo}`
  }
}
