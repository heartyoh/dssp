import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { ChecklistType } from './checklist-type'

@InputType()
export class ChecklistTypePatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class ChecklistTypeList {
  @Field(type => [ChecklistType])
  items: ChecklistType[]

  @Field(type => Int)
  total: number
}
