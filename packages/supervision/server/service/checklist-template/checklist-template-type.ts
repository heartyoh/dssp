import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { ChecklistTemplate } from './checklist-template'

@InputType()
export class ChecklistTemplatePatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class ChecklistTemplateList {
  @Field(type => [ChecklistTemplate])
  items: ChecklistTemplate[]

  @Field(type => Int)
  total: number
}
