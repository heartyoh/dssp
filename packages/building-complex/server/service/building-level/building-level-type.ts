import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { BuildingLevel } from './building-level'
import { BuildingInspection } from '../building-inspection/building-inspection'

@InputType()
export class BuildingLevelPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: false })
  number?: number

  @Field(type => GraphQLUpload, { nullable: true })
  planImage?: FileUpload

  @Field(() => [BuildingInspection], { nullable: true })
  buildingInspections?: BuildingInspection[]
}

@ObjectType()
export class BuildingLevelList {
  @Field(type => [BuildingLevel])
  items: BuildingLevel[]

  @Field(type => Int)
  total: number
}
