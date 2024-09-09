import { Checklist } from './checklist'
import { ChecklistQuery } from './checklist-query'
import { ChecklistMutation } from './checklist-mutation'

export const entities = [Checklist]
export const resolvers = [ChecklistQuery, ChecklistMutation]
