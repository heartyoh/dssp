import { Project } from './project'
import { ProjectQuery } from './project-query'
import { ProjectMutation } from './project-mutation'

export const entities = [Project]
export const resolvers = [ProjectQuery, ProjectMutation]
export const subscribers = []
