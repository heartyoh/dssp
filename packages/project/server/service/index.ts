/* EXPORT ENTITY TYPES */
export * from './task/task'
export * from './project/project'

/* IMPORT ENTITIES AND RESOLVERS */
import { entities as TaskEntities, resolvers as TaskResolvers, subscribers as TaskSubscribers } from './task'
import { entities as ProjectEntities, resolvers as ProjectResolvers, subscribers as ProjectSubscribers } from './project'

export const entities = [
  /* ENTITIES */
	...TaskEntities,
	...ProjectEntities,
]

export const subscribers = [
  /* SUBSCRIBERS */
	...TaskSubscribers,
	...ProjectSubscribers,
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
		...TaskResolvers,
		...ProjectResolvers,
  ]
}
