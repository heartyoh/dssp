import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { Field, InputType, ID } from 'type-graphql'
import { BuildingLevelPatch } from '../building-level/building-level-type'

@InputType()
export class BuildingPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  floorCount?: number

  @Field(type => GraphQLUpload, { nullable: true })
  bim?: FileUpload

  @Field(type => [BuildingLevelPatch], { nullable: true })
  buildingLevels?: BuildingLevelPatch[]
}
