import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { ChecklistTemplateItem } from './checklist-template-item'

@InputType()
export class ChecklistTemplateItemPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  active?: boolean

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload

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
