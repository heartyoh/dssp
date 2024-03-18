/* EXPORT ENTITY TYPES */
export * from './action-plan/action-plan'
export * from './issue/issue'
export * from './check-item/check-item'
export * from './project-report/project-report'
export * from './supervisor/supervisor'

/* IMPORT ENTITIES AND RESOLVERS */
import { entities as ActionPlanEntities, resolvers as ActionPlanResolvers, subscribers as ActionPlanSubscribers } from './action-plan'
import { entities as IssueEntities, resolvers as IssueResolvers, subscribers as IssueSubscribers } from './issue'
import { entities as CheckItemEntities, resolvers as CheckItemResolvers, subscribers as CheckItemSubscribers } from './check-item'
import { entities as ProjectReportEntities, resolvers as ProjectReportResolvers, subscribers as ProjectReportSubscribers } from './project-report'
import { entities as SupervisorEntities, resolvers as SupervisorResolvers, subscribers as SupervisorSubscribers } from './supervisor'

export const entities = [  
  /* ENTITIES */
	...ActionPlanEntities,
	...IssueEntities,
	...CheckItemEntities,
	...ProjectReportEntities,
	...SupervisorEntities,
] 

export const subscribers = [
  /* SUBSCRIBERS */
	...ActionPlanSubscribers,
	...IssueSubscribers,
	...CheckItemSubscribers,
	...ProjectReportSubscribers,
	...SupervisorSubscribers,
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
		...ActionPlanResolvers,
		...IssueResolvers,
		...CheckItemResolvers,
		...ProjectReportResolvers,
		...SupervisorResolvers,
  ] 
}
