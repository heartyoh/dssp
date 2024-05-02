import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { Building } from './building'

@InputType()
export class BuildingPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  floorCount?: number
}

@ObjectType()
export class BuildingList {
  @Field(type => [Building])
  items: Building[]

  @Field(type => Int)
  total: number
}
