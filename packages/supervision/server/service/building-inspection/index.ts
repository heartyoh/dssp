import { BuildingInspection, BuildingInspectionStatus } from './building-inspection'
import { BuildingInspectionQuery } from './building-inspection-query'
import { BuildingInspectionMutation } from './building-inspection-mutation'
import { BuildingInspectionSummary } from './building-inspection-type'
import { BuildingInspectionHistory } from './building-inspection-history'
import { BuildingInspectionHistoryEntitySubscriber } from './event-subscriber'

export const entities = [BuildingInspection, BuildingInspectionHistory]
export const resolvers = [BuildingInspectionQuery, BuildingInspectionMutation]
export const subscribers = [BuildingInspectionHistoryEntitySubscriber]
export const types = [BuildingInspectionStatus, BuildingInspectionSummary]
