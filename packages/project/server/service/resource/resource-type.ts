import { InputType, Field, ID, ObjectType, Int } from 'type-graphql'
import { Resource, ResourceType } from './resource'

@InputType()
export class NewResource {
  @Field()
  name: string

  @Field(type => ResourceType)
  type: ResourceType

  @Field()
  unit: string
}

@InputType()
export class ResourcePatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field(type => ResourceType, { nullable: true })
  type?: ResourceType

  @Field({ nullable: true })
  unit?: string

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class ResourceList {
  @Field(type => [Resource])
  items: Resource[]

  @Field(type => Int)
  total: number
}
