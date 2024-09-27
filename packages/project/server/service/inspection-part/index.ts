import { InspectionPart } from './inspection-part'
import { InspectionPartQuery } from './inspection-part-query'
import { InspectionPartMutation } from './inspection-part-mutation'

export const entities = [InspectionPart]
export const resolvers = [InspectionPartQuery, InspectionPartMutation]
