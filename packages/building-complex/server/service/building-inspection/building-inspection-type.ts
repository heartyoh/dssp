import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { BuildingInspection, BuildingInspectionStatus } from './building-inspection'

@InputType()
export class NewBuildingInspection {
  @Field()
  name: string

  @Field({ nullable: true })
  description?: string

  @Field(type => BuildingInspectionStatus, { nullable: true })
  state?: BuildingInspectionStatus

  @Field({ nullable: true })
  active?: boolean

  @Field({ nullable: true })
  params?: string

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload
}

@InputType()
export class BuildingInspectionPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field(type => BuildingInspectionStatus, { nullable: true })
  state?: BuildingInspectionStatus

  @Field({ nullable: true })
  active?: boolean

  @Field(type => GraphQLUpload, { nullable: true })
  thumbnail?: FileUpload

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class BuildingInspectionList {
  @Field(type => [BuildingInspection])
  items: BuildingInspection[]

  @Field(type => Int)
  total: number
}
