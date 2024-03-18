import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { Issue, IssueStatus } from './issue'

@InputType()
export class NewIssue {
  @Field()
  name: string

  @Field({ nullable: true })
  description?: string

  @Field(type => IssueStatus, { nullable: true })
  state?: IssueStatus

  @Field({ nullable: true })
  active?: boolean

  @Field({ nullable: true })
  params?: string

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload
}

@InputType()
export class IssuePatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field(type => IssueStatus, { nullable: true })
  state?: IssueStatus

  @Field({ nullable: true })
  active?: boolean

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class IssueList {
  @Field(type => [Issue])
  items: Issue[]

  @Field(type => Int)
  total: number
}
