import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { BuildingLevel } from './building-level'

@InputType()
export class BuildingLevelPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: false })
  floor?: number

  @Field(type => GraphQLUpload, { nullable: true })
  mainDrawingUpload: FileUpload

  @Field(type => GraphQLUpload, { nullable: true })
  elevationDrawingUpload: FileUpload

  @Field(type => GraphQLUpload, { nullable: true })
  rebarDistributionDrawingUpload: FileUpload
}

@ObjectType()
export class BuildingLevelList {
  @Field(type => [BuildingLevel])
  items: BuildingLevel[]

  @Field(type => Int)
  total: number
}

@ObjectType()
export class BuildingInspectionSummaryOfLevel {
  @Field(type => Int, { description: '검측 대기 수' })
  wait: number

  @Field(type => Int, { description: '검측 요청 수' })
  request: number

  @Field(type => Int, { description: '검측 통과 수' })
  pass: number

  @Field(type => Int, { description: '검측 실패 수' })
  fail: number
}

export enum BuildingInspectionStatus {
  WAIT = 'WAIT',
  OVERALL_WAIT = 'OVERALL_WAIT',
  REQUEST = 'REQUEST',
  OVERALL_REQUEST = 'OVERALL_REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}
