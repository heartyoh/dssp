/* EXPORT ENTITY TYPES */
export * from './building-level/building-level'
export * from './building/building'
export * from './building/building-type'
export * from './building-complex/building-complex'
export * from './building-complex/building-complex-type'
export * from './building-inspection/building-inspection'

/* IMPORT ENTITIES AND RESOLVERS */
import { entities as BuildingLevelEntities, resolvers as BuildingLevelResolvers } from './building-level'
import { entities as BuildingEntities, resolvers as BuildingResolvers, types as BuildingTypes } from './building'
import { entities as ComplexEntities, resolvers as ComplexResolvers, types as ComplexTypes } from './building-complex'
import {
  entities as BuildingInspectionEntities,
  resolvers as BuildingInspectionResolvers,
  subscribers as BuildingInspectionSubscribers,
  types as BuildingInspectionTypes
} from './building-inspection'

export const entities = [
  /* ENTITIES */
  ...BuildingLevelEntities,
  ...BuildingEntities,
  ...ComplexEntities,
  ...BuildingInspectionEntities
]

export const subscribers = [
  /* SUBSCRIBERS */
  ...BuildingInspectionSubscribers
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
    ...BuildingLevelResolvers,
    ...BuildingResolvers,
    ...ComplexResolvers,
    ...BuildingInspectionResolvers
  ]
}

export const types = [...BuildingTypes, ...ComplexTypes, ...BuildingInspectionTypes]
