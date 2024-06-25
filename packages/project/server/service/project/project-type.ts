import { ObjectType, Field, InputType, Int, Float } from 'type-graphql'
import { Project } from './project'
import { BuildingComplexPatch } from '@dssp/building-complex'
import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'

@InputType()
export class NewProject {
  @Field({ nullable: false })
  name: string
}

@InputType()
export class ProjectPatch {
  @Field({ nullable: false })
  id: string

  @Field({ nullable: false })
  name: string

  @Field({ nullable: true })
  startDate?: string

  @Field({ nullable: true })
  endDate?: string

  @Field(type => GraphQLUpload, { nullable: true })
  mainPhotoUpload?: FileUpload

  @Field(type => Float, { nullable: true })
  totalProgress?: number

  @Field(type => Float, { nullable: true })
  weeklyProgress?: number

  @Field(type => Float, { nullable: true })
  kpi?: number

  @Field(type => Float, { nullable: true })
  inspPassRate?: number

  @Field(type => Float, { nullable: true })
  robotProgressRate?: number

  @Field(type => Float, { nullable: true })
  structuralSafetyRate?: number

  @Field({ nullable: true })
  buildingComplex?: BuildingComplexPatch
}

@ObjectType()
export class ProjectList {
  @Field(type => [Project])
  items: Project[]

  @Field(type => Int)
  total: number
}

@ObjectType()
export class InspectionSummary {
  @Field(type => Int)
  request: number

  @Field(type => Int)
  pass: number

  @Field(type => Int)
  fail: number
}
