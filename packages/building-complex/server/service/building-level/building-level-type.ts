import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { BuildingLevel } from './building-level'
import { BuildingInspectionPatch } from '../building-inspection/building-inspection-type'

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

  @Field(() => [BuildingInspectionPatch], { nullable: true })
  buildingInspections?: BuildingInspectionPatch[]
}

@ObjectType()
export class BuildingLevelList {
  @Field(type => [BuildingLevel])
  items: BuildingLevel[]

  @Field(type => Int)
  total: number
}

@ObjectType()
export class FloorInspectionSummary {
  @Field(type => Int)
  request: number

  @Field(type => Int)
  pass: number

  @Field(type => Int)
  fail: number
}
