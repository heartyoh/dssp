import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { InspectionPart } from './inspection-part'

@InputType()
export class InspectionPartPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field(type => Int, { nullable: true })
  sequence?: number

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class InspectionPartList {
  @Field(type => [InspectionPart])
  items: InspectionPart[]

  @Field(type => Int)
  total: number
}
