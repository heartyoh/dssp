import { ChecklistTemplate } from './checklist-template'
import { ChecklistTemplateQuery } from './checklist-template-query'
import { ChecklistTemplateMutation } from './checklist-template-mutation'

export const entities = [ChecklistTemplate]
export const resolvers = [ChecklistTemplateQuery, ChecklistTemplateMutation]
