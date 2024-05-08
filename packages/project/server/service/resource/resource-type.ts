import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { Resource } from './resource'

@InputType()
export class NewResource {
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
export class ResourcePatch {
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
export class ResourceList {
  @Field(type => [Resource])
  items: Resource[]

  @Field(type => Int)
  total: number
}
