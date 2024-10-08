import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { ChecklistType, ChecklistTypeMainType } from './checklist-type'

@InputType()
export class ChecklistTypePatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  mainType: ChecklistTypeMainType

  @Field({ nullable: true })
  detailType: string

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
