import { ProjectReport } from './project-report'
import { ProjectReportQuery } from './project-report-query'
import { ProjectReportMutation } from './project-report-mutation'

export const entities = [ProjectReport]
export const resolvers = [ProjectReportQuery, ProjectReportMutation]
export const subscribers = []
