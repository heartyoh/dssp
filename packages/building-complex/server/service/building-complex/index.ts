import { BuildingComplex } from './building-complex'
import { BuildingComplexQuery } from './building-complex-query'
import { BuildingComplexMutation } from './building-complex-mutation'

export const entities = [BuildingComplex]
export const resolvers = [BuildingComplexQuery, BuildingComplexMutation]
