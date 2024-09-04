/* EXPORT ENTITY TYPES */
export * from './action-plan/action-plan'
export * from './issue/issue'
export * from './project-report/project-report'
export * from './supervisor/supervisor'

/* IMPORT ENTITIES AND RESOLVERS */
import {
  entities as ActionPlanEntities,
  resolvers as ActionPlanResolvers,
  subscribers as ActionPlanSubscribers
} from './action-plan'
import { entities as IssueEntities, resolvers as IssueResolvers, subscribers as IssueSubscribers } from './issue'
import {
  entities as ProjectReportEntities,
  resolvers as ProjectReportResolvers,
  subscribers as ProjectReportSubscribers
} from './project-report'
import {
  entities as SupervisorEntities,
  resolvers as SupervisorResolvers,
  subscribers as SupervisorSubscribers
} from './supervisor'

export const entities = [
  /* ENTITIES */
  ...ActionPlanEntities,
  ...IssueEntities,
  ...ProjectReportEntities,
  ...SupervisorEntities
]

export const subscribers = [
  /* SUBSCRIBERS */
  ...ActionPlanSubscribers,
  ...IssueSubscribers,
  ...ProjectReportSubscribers,
  ...SupervisorSubscribers
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
    ...ActionPlanResolvers,
    ...IssueResolvers,
    ...ProjectReportResolvers,
    ...SupervisorResolvers
  ]
}
