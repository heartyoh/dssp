import { BuildingPatch } from '../building/building-type'
import { Building } from '../building/building'
import { Field, InputType, ObjectType, Float } from 'type-graphql'
import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'

@InputType()
export class BuildingComplexPatch {
  @Field({ nullable: true })
  id?: string

  @Field({ nullable: true })
  address?: string

  @Field(type => Float, { nullable: true })
  area?: number

  @Field(type => Float, { nullable: true })
  latitude?: number

  @Field(type => Float, { nullable: true })
  longitude?: number

  @Field({ nullable: true })
  clientCompany?: string

  @Field({ nullable: true })
  constructionCompany?: string

  @Field({ nullable: true })
  supervisoryCompany?: string

  @Field({ nullable: true })
  designCompany?: string

  @Field(type => GraphQLUpload, { nullable: true })
  mainPhoto?: FileUpload

  @Field({ nullable: true })
  constructionType?: string

  @Field(type => Float, { nullable: true })
  constructionCost?: number

  @Field({ nullable: true })
  etc?: string

  @Field(type => Float, { nullable: true })
  householdCount?: number

  @Field(type => Float, { nullable: true })
  buildingCount?: number

  @Field({ nullable: true })
  notice?: string

  @Field({ nullable: true })
  planXScale: number

  @Field({ nullable: true })
  planYScale: number

  @Field(type => [BuildingPatch], { nullable: true })
  buildings?: BuildingPatch[]
}
