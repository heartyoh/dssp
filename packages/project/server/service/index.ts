/* EXPORT ENTITY TYPES */
export * from './resource/resource'
export * from './check-item/check-item'
export * from './checklist/checklist'
export * from './task/task'
export * from './project/project'

/* IMPORT ENTITIES AND RESOLVERS */
import { entities as ResourceEntities, resolvers as ResourceResolvers } from './resource'
import { entities as CheckItemEntities, resolvers as CheckItemResolvers } from './check-item'
import { entities as ChecklistEntities, resolvers as ChecklistResolvers } from './checklist'
import { entities as TaskEntities, resolvers as TaskResolvers } from './task'
import { entities as ProjectEntities, resolvers as ProjectResolvers, types as ProjectTypes } from './project'

export const entities = [
  /* ENTITIES */
  ...ResourceEntities,
  ...CheckItemEntities,
  ...ChecklistEntities,
  ...TaskEntities,
  ...ProjectEntities
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
    ...ResourceResolvers,
    ...CheckItemResolvers,
    ...ChecklistResolvers,
    ...TaskResolvers,
    ...ProjectResolvers
  ]
}

export const types = [...ProjectTypes]
