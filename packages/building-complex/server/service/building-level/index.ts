import { BuildingLevel } from './building-level'
import { BuildingLevelQuery } from './building-level-query'
import { BuildingLevelMutation } from './building-level-mutation'

export const entities = [BuildingLevel]
export const resolvers = [BuildingLevelQuery, BuildingLevelMutation]
export const subscribers = []
