import { WorkerType } from './worker-type'
import { WorkerTypeQuery } from './worker-type-query'
import { WorkerTypeMutation } from './worker-type-mutation'

export const entities = [WorkerType]
export const resolvers = [WorkerTypeQuery, WorkerTypeMutation]
