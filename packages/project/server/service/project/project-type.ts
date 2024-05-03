import { ObjectType, Field, InputType, Int } from 'type-graphql'
import { Project } from './project'

@InputType()
export class NewProject {
  @Field()
  name: string
}

@InputType()
export class ProjectPatch {
  @Field({ nullable: false })
  id?: string

  @Field({ nullable: false })
  name: string

  @Field({ nullable: true })
  startDate?: Date

  @Field({ nullable: true })
  endDate?: Date

  @Field({ nullable: true })
  totalProgress?: number

  @Field({ nullable: true })
  weeklyProgress?: number

  @Field({ nullable: true })
  kpi?: number

  @Field({ nullable: true })
  inspPassRate?: number

  @Field({ nullable: true })
  robotProgressRate?: number

  @Field({ nullable: true })
  structuralSafetyRate?: number
}

@ObjectType()
export class ProjectList {
  @Field(type => [Project])
  items: Project[]

  @Field(type => Int)
  total: number
}
