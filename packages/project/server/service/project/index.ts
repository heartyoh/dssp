import { Project } from './project'
import { ProjectQuery } from './project-query'
import { ProjectMutation } from './project-mutation'
import { InspectionSummary } from './project-type'

export const entities = [Project]
export const resolvers = [ProjectQuery, ProjectMutation]
export const types = [InspectionSummary]
