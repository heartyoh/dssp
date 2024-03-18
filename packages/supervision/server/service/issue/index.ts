import { Issue } from './issue'
import { IssueQuery } from './issue-query'
import { IssueMutation } from './issue-mutation'

export const entities = [Issue]
export const resolvers = [IssueQuery, IssueMutation]
export const subscribers = []
