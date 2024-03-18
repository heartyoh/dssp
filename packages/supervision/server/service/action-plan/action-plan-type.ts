import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { ActionPlan, ActionPlanStatus } from './action-plan'

@InputType()
export class NewActionPlan {
  @Field()
  name: string

  @Field({ nullable: true })
  description?: string

  @Field(type => ActionPlanStatus, { nullable: true })
  state?: ActionPlanStatus

  @Field({ nullable: true })
  active?: boolean

  @Field({ nullable: true })
  params?: string

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload
}

@InputType()
export class ActionPlanPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field(type => ActionPlanStatus, { nullable: true })
  state?: ActionPlanStatus

  @Field({ nullable: true })
  active?: boolean

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class ActionPlanList {
  @Field(type => [ActionPlan])
  items: ActionPlan[]

  @Field(type => Int)
  total: number
}
