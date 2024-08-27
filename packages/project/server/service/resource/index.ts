import { Resource } from './resource'
import { ResourceQuery } from './resource-query'
import { ResourceMutation } from './resource-mutation'

export const entities = [Resource]
export const resolvers = [ResourceQuery, ResourceMutation]
export const subscribers = []
