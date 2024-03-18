import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { ProjectReport, ProjectReportStatus } from './project-report'

@InputType()
export class NewProjectReport {
  @Field()
  name: string

  @Field({ nullable: true })
  description?: string

  @Field(type => ProjectReportStatus, { nullable: true })
  state?: ProjectReportStatus

  @Field({ nullable: true })
  active?: boolean

  @Field({ nullable: true })
  params?: string

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload
}

@InputType()
export class ProjectReportPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field(type => ProjectReportStatus, { nullable: true })
  state?: ProjectReportStatus

  @Field({ nullable: true })
  active?: boolean

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class ProjectReportList {
  @Field(type => [ProjectReport])
  items: ProjectReport[]

  @Field(type => Int)
  total: number
}
