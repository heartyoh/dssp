/* EXPORT ENTITY TYPES */
export * from './building-level/building-level'
export * from './building/building'
export * from './building/building-type'
export * from './building-complex/building-complex'
export * from './building-complex/building-complex-type'

/* IMPORT ENTITIES AND RESOLVERS */
import { entities as BuildingLevelEntities, resolvers as BuildingLevelResolvers } from './building-level'
import { entities as BuildingEntities, resolvers as BuildingResolvers, types as BuildingTypes } from './building'
import { entities as ComplexEntities, resolvers as ComplexResolvers, types as ComplexTypes } from './building-complex'

export const entities = [
  /* ENTITIES */
  ...BuildingLevelEntities,
  ...BuildingEntities,
  ...ComplexEntities
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
    ...BuildingLevelResolvers,
    ...BuildingResolvers,
    ...ComplexResolvers
  ]
}

export const types = [...BuildingTypes, ...ComplexTypes]
