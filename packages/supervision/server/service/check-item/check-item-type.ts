import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { CheckItem, CheckItemStatus } from './check-item'

@InputType()
export class NewCheckItem {
  @Field()
  name: string

  @Field({ nullable: true })
  description?: string

  @Field(type => CheckItemStatus, { nullable: true })
  state?: CheckItemStatus

  @Field({ nullable: true })
  active?: boolean

  @Field({ nullable: true })
  params?: string

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload
}

@InputType()
export class CheckItemPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field(type => CheckItemStatus, { nullable: true })
  state?: CheckItemStatus

  @Field({ nullable: true })
  active?: boolean

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload

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
