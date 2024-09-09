/* EXPORT ENTITY TYPES */
export * from './task-resource/task-resource'
export * from './resource/resource'
export * from './construction-detail-type/construction-detail-type'
export * from './construction-type/construction-type'
export * from './worker-type/worker-type'
export * from './manager/manager'
export * from './task/task'
export * from './project/project'

/* IMPORT ENTITIES AND RESOLVERS */
import { entities as TaskResourceEntities, resolvers as TaskResourceResolvers } from './task-resource'
import { entities as ResourceEntities, resolvers as ResourceResolvers } from './resource'
import {
  entities as ConstructionDetailTypeEntities,
  resolvers as ConstructionDetailTypeResolvers
} from './construction-detail-type'
import { entities as ConstructionTypeEntities, resolvers as ConstructionTypeResolvers } from './construction-type'
import { entities as WorkerTypeEntities, resolvers as WorkerTypeResolvers } from './worker-type'
import { entities as ManagerEntities, resolvers as ManagerResolvers } from './manager'
import { entities as TaskEntities, resolvers as TaskResolvers } from './task'
import { entities as ProjectEntities, resolvers as ProjectResolvers } from './project'

export const entities = [
  /* ENTITIES */
  ...TaskResourceEntities,
  ...ResourceEntities,
  ...ConstructionDetailTypeEntities,
  ...ConstructionTypeEntities,
  ...WorkerTypeEntities,
  ...ManagerEntities,
  ...TaskEntities,
  ...ProjectEntities
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
    ...TaskResourceResolvers,
    ...ResourceResolvers,
    ...ConstructionDetailTypeResolvers,
    ...ConstructionTypeResolvers,
    ...WorkerTypeResolvers,
    ...ManagerResolvers,
    ...TaskResolvers,
    ...ProjectResolvers
  ]
}
