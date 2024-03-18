import { CheckItem } from './check-item'
import { CheckItemQuery } from './check-item-query'
import { CheckItemMutation } from './check-item-mutation'

export const entities = [CheckItem]
export const resolvers = [CheckItemQuery, CheckItemMutation]
export const subscribers = []
