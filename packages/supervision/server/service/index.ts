/* EXPORT ENTITY TYPES */
export * from './action-plan/action-plan'
export * from './issue/issue'
export * from './project-report/project-report'
export * from './supervisor/supervisor'
export * from './checklist-type/checklist-type'
export * from './checklist-template/checklist-template'
export * from './checklist-template-item/checklist-template-item'

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
import { entities as ChecklistTypeEntities, resolvers as ChecklistTypeResolvers } from './checklist-type'
import { entities as ChecklistTemplateItemEntities, resolvers as ChecklistTemplateItemResolvers } from './checklist-template-item'
import { entities as ChecklistTemplateEntities, resolvers as ChecklistTemplateResolvers } from './checklist-template'

export const entities = [
  /* ENTITIES */
  ...ActionPlanEntities,
  ...IssueEntities,
  ...ProjectReportEntities,
  ...SupervisorEntities,
  ...ChecklistTypeEntities,
  ...ChecklistTemplateItemEntities,
  ...ChecklistTemplateEntities
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
    ...SupervisorResolvers,
    ...ChecklistTypeResolvers,
    ...ChecklistTemplateItemResolvers,
    ...ChecklistTemplateResolvers
  ]
}
