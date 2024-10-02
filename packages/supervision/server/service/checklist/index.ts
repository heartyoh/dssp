import { Checklist } from './checklist'
import { ChecklistQuery } from './checklist-query'
import { ChecklistHistory } from './checklist-history'
import { ChecklistMutation } from './checklist-mutation'
import { ChecklistHistoryEntitySubscriber } from './event-subscriber'

export const entities = [Checklist, ChecklistHistory]
export const resolvers = [ChecklistQuery, ChecklistMutation]
export const subscribers = [ChecklistHistoryEntitySubscriber]
