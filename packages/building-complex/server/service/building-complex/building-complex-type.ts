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
  drawingUpload?: FileUpload

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
  planXScale?: number

  @Field({ nullable: true })
  planYScale?: number

  @Field(() => [String], { nullable: true })
  overallConstructorEmails?: string[]

  @Field(() => [String], { nullable: true })
  taskConstructorEmails?: string[]

  @Field(() => [String], { nullable: true })
  overallSupervisoryEmails?: string[]

  @Field(() => [String], { nullable: true })
  taskSupervisoryEmails?: string[]

  @Field(type => [BuildingPatch], { nullable: true })
  buildings?: BuildingPatch[]
}
