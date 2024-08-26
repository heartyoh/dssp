import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { ConstructionDetailType } from './construction-detail-type'

@InputType()
export class ConstructionDetailTypePatch {
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
export class ConstructionDetailTypeList {
  @Field(type => [ConstructionDetailType])
  items: ConstructionDetailType[]

  @Field(type => Int)
  total: number
}
