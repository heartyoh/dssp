/* EXPORT ENTITY TYPES */
export * from './checklist-template-item/checklist-template-item'
export * from './checklist-template/checklist-template'
export * from './construction-type/construction-type'
export * from './worker-type/worker-type'
export * from './manager/manager'
export * from './check-item/check-item'
export * from './checklist/checklist'
export * from './task/task'
export * from './project/project'

/* IMPORT ENTITIES AND RESOLVERS */
import { entities as ChecklistTemplateItemEntities, resolvers as ChecklistTemplateItemResolvers } from './checklist-template-item'
import { entities as ChecklistTemplateEntities, resolvers as ChecklistTemplateResolvers } from './checklist-template'
import { entities as ConstructionTypeEntities, resolvers as ConstructionTypeResolvers } from './construction-type'
import { entities as WorkerTypeEntities, resolvers as WorkerTypeResolvers } from './worker-type'
import { entities as ManagerEntities, resolvers as ManagerResolvers } from './manager'
import { entities as CheckItemEntities, resolvers as CheckItemResolvers } from './check-item'
import { entities as ChecklistEntities, resolvers as ChecklistResolvers } from './checklist'
import { entities as TaskEntities, resolvers as TaskResolvers } from './task'
import { entities as ProjectEntities, resolvers as ProjectResolvers, types as ProjectTypes } from './project'

export const entities = [
  /* ENTITIES */
  ...ChecklistTemplateItemEntities,
  ...ChecklistTemplateEntities,
  ...ConstructionTypeEntities,
  ...WorkerTypeEntities,
  ...ManagerEntities,
  ...CheckItemEntities,
  ...ChecklistEntities,
  ...TaskEntities,
  ...ProjectEntities
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
    ...ChecklistTemplateItemResolvers,
    ...ChecklistTemplateResolvers,
    ...ConstructionTypeResolvers,
    ...WorkerTypeResolvers,
    ...ManagerResolvers,
    ...CheckItemResolvers,
    ...ChecklistResolvers,
    ...TaskResolvers,
    ...ProjectResolvers
  ]
}

export const types = [...ProjectTypes]
