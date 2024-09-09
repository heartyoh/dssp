import { ChecklistType } from './checklist-type'
import { ChecklistTypeQuery } from './checklist-type-query'
import { ChecklistTypeMutation } from './checklist-type-mutation'

export const entities = [ChecklistType]
export const resolvers = [ChecklistTypeQuery, ChecklistTypeMutation]
