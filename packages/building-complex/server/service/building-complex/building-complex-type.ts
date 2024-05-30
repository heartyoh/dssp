import { BuildingPatch } from '../building/building-type'
import { Building } from '../building/building'
import { Field, InputType, ObjectType, Float } from 'type-graphql'

@InputType()
export class BuildingComplexPatch {
  @Field({ nullable: true })
  id?: string

  @Field({ nullable: false })
  address: string

  @Field(type => Float, { nullable: false })
  area: number

  @Field({ nullable: false })
  clientCompany: string

  @Field({ nullable: false })
  constructionCompany: string

  @Field({ nullable: false })
  supervisoryCompany: string

  @Field({ nullable: false })
  designCompany: string

  @Field({ nullable: true })
  mainPhoto?: string

  @Field({ nullable: false })
  constructionType: string

  @Field(type => Float, { nullable: true })
  constructionCost?: number

  @Field({ nullable: true })
  etc?: string

  @Field(type => Float, { nullable: true })
  householdCount?: number

  @Field(type => Float, { nullable: true })
  buildingCount?: number

  @Field(type => [BuildingPatch], { nullable: true })
  buildings?: BuildingPatch[]
}
