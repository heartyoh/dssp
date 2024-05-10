import { Building } from './building'
import { BuildingQuery } from './building-query'
import { BuildingMutation } from './building-mutation'
import { BuildingPatch } from './building-type'

export const entities = [Building]
export const resolvers = [BuildingQuery, BuildingMutation]
export const types = [BuildingPatch]
