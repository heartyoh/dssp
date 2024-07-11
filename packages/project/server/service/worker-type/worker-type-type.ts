import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { WorkerType } from './worker-type'

@InputType()
export class WorkerTypePatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  description?: string

  @Field()
  cuFlag: string
}

@ObjectType()
export class WorkerTypeList {
  @Field(type => [WorkerType])
  items: WorkerType[]

  @Field(type => Int)
  total: number
}
