import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { Manager } from './manager'
import { User } from '@things-factory/auth-base'

@InputType()
export class ManagerPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  phone?: string

  @Field({ nullable: true })
  position?: string

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

  @Field({ nullable: true })
  name?: string
}
