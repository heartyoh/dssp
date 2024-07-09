import { Manager } from './manager'
import { ManagerQuery } from './manager-query'
import { ManagerMutation } from './manager-mutation'

export const entities = [Manager]
export const resolvers = [ManagerQuery, ManagerMutation]
