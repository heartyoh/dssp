import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { CheckItem } from './check-item'

@InputType()
export class NewCheckItem {
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
export class CheckItemPatch {
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
export class CheckItemList {
  @Field(type => [CheckItem])
  items: CheckItem[]

  @Field(type => Int)
  total: number
}
