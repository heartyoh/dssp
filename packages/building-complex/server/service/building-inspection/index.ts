import { BuildingInspection, BuildingInspectionStatus } from './building-inspection'
import { BuildingInspectionQuery } from './building-inspection-query'
import { BuildingInspectionMutation } from './building-inspection-mutation'
import { BuildingInspectionSummary } from './building-inspection-type'

export const entities = [BuildingInspection]
export const resolvers = [BuildingInspectionQuery, BuildingInspectionMutation]
export const types = [BuildingInspectionStatus, BuildingInspectionSummary]
