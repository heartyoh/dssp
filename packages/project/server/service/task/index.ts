import { Task } from './task'
import { TaskQuery } from './task-query'
import { TaskMutation } from './task-mutation'

export const entities = [Task]
export const resolvers = [TaskQuery, TaskMutation]
