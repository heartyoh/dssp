import { ConstructionType } from './construction-type'
import { ConstructionTypeQuery } from './construction-type-query'
import { ConstructionTypeMutation } from './construction-type-mutation'

export const entities = [ConstructionType]
export const resolvers = [ConstructionTypeQuery, ConstructionTypeMutation]
