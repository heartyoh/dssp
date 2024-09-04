import { Inspection, InspectionStatus } from './inspection'
import { InspectionQuery } from './inspection-query'
import { InspectionMutation } from './inspection-mutation'

export const entities = [Inspection]
export const resolvers = [InspectionQuery, InspectionMutation]
export const types = [InspectionStatus]
