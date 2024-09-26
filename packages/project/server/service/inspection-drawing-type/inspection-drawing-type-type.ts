import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { InspectionDrawingType } from './inspection-drawing-type'

@InputType()
export class InspectionDrawingTypePatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class InspectionDrawingTypeList {
  @Field(type => [InspectionDrawingType])
  items: InspectionDrawingType[]

  @Field(type => Int)
  total: number
}
