import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ChecklistItem } from './checklist-item'

@ObjectType()
export class ChecklistItemList {
  @Field(type => [ChecklistItem])
  items: ChecklistItem[]

  @Field(type => Int)
  total: number
}
