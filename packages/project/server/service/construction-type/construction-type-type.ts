import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { ConstructionType } from './construction-type'

@InputType()
export class ConstructionTypePatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class ConstructionTypeList {
  @Field(type => [ConstructionType])
  items: ConstructionType[]

  @Field(type => Int)
  total: number
}
