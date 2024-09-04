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
export * from './checklist-item/checklist-item'
export * from './checklist/checklist'
export * from './task/task'
export * from './project/project'
export * from './inspection/inspection'

/* IMPORT ENTITIES AND RESOLVERS */
import { entities as TaskResourceEntities, resolvers as TaskResourceResolvers } from './task-resource'
import { entities as ResourceEntities, resolvers as ResourceResolvers } from './resource'
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
import { entities as CheckItemEntities, resolvers as CheckItemResolvers } from './checklist-item'
import { entities as ChecklistEntities, resolvers as ChecklistResolvers } from './checklist'
import { entities as TaskEntities, resolvers as TaskResolvers } from './task'
import { entities as ProjectEntities, resolvers as ProjectResolvers } from './project'
import { entities as InspectionEntities, resolvers as InspectionResolvers, types as InspectionTypes } from './inspection'

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
  ...ProjectEntities,
  ...InspectionEntities
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
    ...ProjectResolvers,
    ...InspectionResolvers
  ]
}

export const types = [...InspectionTypes]
