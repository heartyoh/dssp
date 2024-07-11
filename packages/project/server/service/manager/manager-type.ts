import { ObjectType, Field, InputType, ID } from 'type-graphql'

@InputType()
export class ManagerPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  phone?: string

  @Field({ nullable: true })
  position?: string

  @Field(type => ID, { nullable: true })
  userId?: string

  @Field({ nullable: true })
  name?: string
}

@ObjectType()
export class ManagerOutput {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  phone?: string

  @Field({ nullable: true })
  position?: string

  @Field(type => ID)
  userId?: string

  @Field({ nullable: true })
  name?: string
}
