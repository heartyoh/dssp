import { Field, InputType } from 'type-graphql'

@InputType()
export class BuildingComplexPatch {
  @Field({ nullable: true })
  id?: string

  @Field({ nullable: false })
  address: string

  @Field({ nullable: false })
  area: number

  @Field({ nullable: false })
  clientCompany: string

  @Field({ nullable: false })
  constructionCompany: string

  @Field({ nullable: false })
  supervisor: string

  @Field({ nullable: false })
  architect: string

  @Field({ nullable: true })
  mainPhoto?: string

  @Field({ nullable: false })
  constructionType: string

  @Field({ nullable: true })
  constructionCost?: number

  @Field({ nullable: true })
  etc?: string

  @Field({ nullable: true })
  householdCount?: number

  @Field({ nullable: true })
  buildingCount?: number
}
