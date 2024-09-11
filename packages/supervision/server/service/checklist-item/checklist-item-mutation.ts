import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { ChecklistItem } from './checklist-item'

@Resolver(ChecklistItem)
export class ChecklistItemMutation {}
