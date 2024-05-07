import { BuildingInspection } from './building-inspection'
import { BuildingInspectionQuery } from './building-inspection-query'
import { BuildingInspectionMutation } from './building-inspection-mutation'

export const entities = [BuildingInspection]
export const resolvers = [BuildingInspectionQuery, BuildingInspectionMutation]
