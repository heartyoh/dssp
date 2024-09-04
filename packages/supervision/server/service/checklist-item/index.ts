import { ChecklistItem } from './checklist-item'
import { ChecklistItemQuery } from './checklist-item-query'
import { ChecklistItemMutation } from './checklist-item-mutation'

export const entities = [ChecklistItem]
export const resolvers = [ChecklistItemQuery, ChecklistItemMutation]
