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
