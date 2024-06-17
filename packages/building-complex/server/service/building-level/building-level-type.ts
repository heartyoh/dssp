import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { BuildingLevel } from './building-level'
import { BuildingInspectionPatch } from '../building-inspection/building-inspection-type'

@InputType()
export class BuildingLevelPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: false })
  floor?: number

  @Field(type => GraphQLUpload, { nullable: true })
  mainDrawing: FileUpload

  @Field(type => GraphQLUpload, { nullable: true })
  structuralDrawing: FileUpload

  @Field(type => GraphQLUpload, { nullable: true })
  crossSectionDrawing: FileUpload

  @Field(type => GraphQLUpload, { nullable: true })
  rebarDistributionDrawing: FileUpload

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
