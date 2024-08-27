import { TaskResource } from './task-resource'
import { TaskResourceQuery } from './task-resource-query'
import { TaskResourceMutation } from './task-resource-mutation'

export const entities = [TaskResource]
export const resolvers = [TaskResourceQuery, TaskResourceMutation]
export const subscribers = []
