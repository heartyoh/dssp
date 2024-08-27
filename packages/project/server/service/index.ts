/* EXPORT ENTITY TYPES */
export * from './task-resource/task-resource'
export * from './resource/resource'
export * from './construction-detail-type/construction-detail-type'
export * from './checklist-type/checklist-type'
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
import { entities as TaskResourceEntities, resolvers as TaskResourceResolvers, subscribers as TaskResourceSubscribers } from './task-resource'
import { entities as ResourceEntities, resolvers as ResourceResolvers, subscribers as ResourceSubscribers } from './resource'
import {
  entities as ConstructionDetailTypeEntities,
  resolvers as ConstructionDetailTypeResolvers
} from './construction-detail-type'
import { entities as ChecklistTypeEntities, resolvers as ChecklistTypeResolvers } from './checklist-type'
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
	...TaskResourceEntities,
	...ResourceEntities,
  ...ConstructionDetailTypeEntities,
  ...ChecklistTypeEntities,
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
		...TaskResourceResolvers,
		...ResourceResolvers,
    ...ConstructionDetailTypeResolvers,
    ...ChecklistTypeResolvers,
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
