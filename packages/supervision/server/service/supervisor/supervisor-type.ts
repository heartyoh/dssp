import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { Supervisor, SupervisorStatus } from './supervisor'

@InputType()
export class NewSupervisor {
  @Field()
  name: string

  @Field({ nullable: true })
  description?: string

  @Field(type => SupervisorStatus, { nullable: true })
  state?: SupervisorStatus

  @Field({ nullable: true })
  active?: boolean

  @Field({ nullable: true })
  params?: string

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload
}

@InputType()
export class SupervisorPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field(type => SupervisorStatus, { nullable: true })
  state?: SupervisorStatus

  @Field({ nullable: true })
  active?: boolean

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class SupervisorList {
  @Field(type => [Supervisor])
  items: Supervisor[]

  @Field(type => Int)
  total: number
}
