import { ChecklistTemplateItem } from './checklist-template-item'
import { ChecklistTemplateItemQuery } from './checklist-template-item-query'
import { ChecklistTemplateItemMutation } from './checklist-template-item-mutation'

export const entities = [ChecklistTemplateItem]
export const resolvers = [ChecklistTemplateItemQuery, ChecklistTemplateItemMutation]
