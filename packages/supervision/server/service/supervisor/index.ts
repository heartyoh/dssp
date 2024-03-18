import { Supervisor } from './supervisor'
import { SupervisorQuery } from './supervisor-query'
import { SupervisorMutation } from './supervisor-mutation'

export const entities = [Supervisor]
export const resolvers = [SupervisorQuery, SupervisorMutation]
export const subscribers = []
