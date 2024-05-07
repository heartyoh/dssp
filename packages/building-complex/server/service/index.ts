/* EXPORT ENTITY TYPES */
export * from './building-inspection-attachment/building-inspection-attachment'
export * from './building-inspection/building-inspection'
export * from './building-level/building-level'
export * from './building/building'
export * from './building-complex/building-complex'

/* IMPORT ENTITIES AND RESOLVERS */
import { entities as BuildingInspectionAttachmentEntities } from './building-inspection-attachment'
import { entities as BuildingInspectionEntities, resolvers as BuildingInspectionResolvers } from './building-inspection'
import { entities as BuildingLevelEntities, resolvers as BuildingLevelResolvers } from './building-level'
import { entities as BuildingEntities, resolvers as BuildingResolvers } from './building'
import { entities as ComplexEntities, resolvers as ComplexResolvers } from './building-complex'

export const entities = [
  /* ENTITIES */
  ...BuildingInspectionAttachmentEntities,
  ...BuildingInspectionEntities,
  ...BuildingLevelEntities,
  ...BuildingEntities,
  ...ComplexEntities
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
    ...BuildingInspectionResolvers,
    ...BuildingLevelResolvers,
    ...BuildingResolvers,
    ...ComplexResolvers
  ]
}
