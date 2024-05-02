import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { Project, ProjectStatus } from './project'

@InputType()
export class ProjectPatch {
  @Field({ nullable: false })
  id?: string

  @Field({ nullable: false })
  name: string

  @Field({ nullable: true })
  startDate?: Date

  @Field({ nullable: true })
  endDate?: Date

  @Field({ nullable: true })
  totalProgress?: number

  @Field({ nullable: true })
  weeklyProgress?: number

  @Field({ nullable: true })
  kpi?: number

  @Field({ nullable: true })
  inspPassRate?: number

  @Field({ nullable: true })
  robotProgressRate?: number

  @Field({ nullable: true })
  structuralSafetyRate?: number
}

@ObjectType()
export class ProjectList {
  @Field(type => [Project])
  items: Project[]

  @Field(type => Int)
  total: number
}
