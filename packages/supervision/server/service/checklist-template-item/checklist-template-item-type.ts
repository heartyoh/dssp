import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { ChecklistTemplateItem } from './checklist-template-item'
import { ChecklistTypeMainType } from '../checklist-type/checklist-type'

@InputType()
export class ChecklistTemplateItemPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field(type => Int, { nullable: true })
  sequence?: number

  @Field({ nullable: true })
  mainType?: ChecklistTypeMainType

  @Field({ nullable: true })
  detailType?: string

  @Field({ nullable: true })
  checklistTemplateId?: string

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class ChecklistTemplateItemList {
  @Field(type => [ChecklistTemplateItem])
  items: ChecklistTemplateItem[]

  @Field(type => Int)
  total: number
}
