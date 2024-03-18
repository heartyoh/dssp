/* EXPORT ENTITY TYPES */
export * from './building-level/building-level'
export * from './building/building'
export * from './building-complex/building-complex'

/* IMPORT ENTITIES AND RESOLVERS */
import {
  entities as BuildingLevelEntities,
  resolvers as BuildingLevelResolvers,
  subscribers as BuildingLevelSubscribers
} from './building-level'
import {
  entities as BuildingEntities,
  resolvers as BuildingResolvers,
  subscribers as BuildingSubscribers
} from './building'
import {
  entities as ComplexEntities,
  resolvers as ComplexResolvers,
  subscribers as ComplexSubscribers
} from './building-complex'

export const entities = [
  /* ENTITIES */
  ...BuildingLevelEntities,
  ...BuildingEntities,
  ...ComplexEntities
]

export const subscribers = [
  /* SUBSCRIBERS */
  ...BuildingLevelSubscribers,
  ...BuildingSubscribers,
  ...ComplexSubscribers
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
    ...BuildingLevelResolvers,
    ...BuildingResolvers,
    ...ComplexResolvers
  ]
}
