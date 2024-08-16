import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { ChecklistTypeDetail } from './checklist-type-detail'

@InputType()
export class ChecklistTypeDetailPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  sequence?: number

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class ChecklistTypeDetailList {
  @Field(type => [ChecklistTypeDetail])
  items: ChecklistTypeDetail[]

  @Field(type => Int)
  total: number
}
