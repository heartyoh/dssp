import { BuildingComplex } from './building-complex'
import { BuildingComplexQuery } from './building-complex-query'
import { BuildingComplexMutation } from './building-complex-mutation'
import { BuildingComplexPatch } from './building-complex-type'

export const entities = [BuildingComplex]
export const resolvers = [BuildingComplexQuery, BuildingComplexMutation]
export const types = [BuildingComplexPatch]
