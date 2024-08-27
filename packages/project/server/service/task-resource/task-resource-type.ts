import { InputType, Field, ID, ObjectType, Int } from 'type-graphql'
import { TaskResource } from './task-resource'

@InputType()
export class NewTaskResource {
  @Field(type => ID)
  taskId: string

  @Field(type => ID)
  resourceId: string

  @Field()
  quantity: number
}

@InputType()
export class TaskResourcePatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field(type => ID, { nullable: true })
  taskId?: string

  @Field(type => ID, { nullable: true })
  resourceId?: string

  @Field({ nullable: true })
  quantity?: number

  @Field({ nullable: true })
  cuFlag?: string
}

@ObjectType()
export class TaskResourceList {
  @Field(type => [TaskResource])
  items: TaskResource[]

  @Field(type => Int)
  total: number
}
