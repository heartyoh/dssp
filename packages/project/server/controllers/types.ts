import { Task, TaskType } from '../service/task/task'

export interface RawResource {
  type: string
  allocated: number
}

export interface RawTask {
  code: string
  title: string
  type?: TaskType
  duration?: number
  startDate?: Date | string
  dependsOn?: string
  progress?: number
  tags?: string[]
  style?: string
  resources?: RawResource[]
  children?: RawTask[]
}
