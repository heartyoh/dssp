import { ActionPlan } from './action-plan'
import { ActionPlanQuery } from './action-plan-query'
import { ActionPlanMutation } from './action-plan-mutation'

export const entities = [ActionPlan]
export const resolvers = [ActionPlanQuery, ActionPlanMutation]
export const subscribers = []
