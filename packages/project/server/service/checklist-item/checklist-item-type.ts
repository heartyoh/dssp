import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { ChecklistItem } from './checklist-item'

@InputType()
export class NewChecklistItem {
  @Field()
  name: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  active?: boolean

  @Field({ nullable: true })
  params?: string
}

@InputType()
export class ChecklistItemPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  active?: boolean

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class ChecklistItemList {
  @Field(type => [ChecklistItem])
  items: ChecklistItem[]

  @Field(type => Int)
  total: number
}
