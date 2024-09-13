import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { BuildingInspection } from './building-inspection'

@InputType()
class ChecklistInputType {
  @Field({ nullable: false })
  name: string

  @Field({ nullable: false })
  constructionType: string

  @Field({ nullable: false })
  constructionDetailType: string

  @Field({ nullable: false })
  location?: string
}

@InputType()
class ChecklistItemInputType {
  @Field({ nullable: false })
  name: string

  @Field({ nullable: false })
  mainType: string

  @Field({ nullable: false })
  detailType: string
}

@InputType()
export class NewBuildingInspection {
  @Field({ nullable: false })
  buildingLevelId: string

  @Field(type => ChecklistInputType, { nullable: false })
  checklist: ChecklistInputType

  @Field(type => [ChecklistItemInputType], { nullable: false })
  checklistItem: ChecklistItemInputType[]
}

@ObjectType()
export class BuildingInspectionSummary {
  @Field(type => Int, { description: '검사 요청 수' })
  request: number

  @Field(type => Int, { description: '검사 통과 수' })
  pass: number

  @Field(type => Int, { description: '검사 실패 수' })
  fail: number
}

@ObjectType()
export class BuildingInspectionList {
  @Field(type => [BuildingInspection])
  items: BuildingInspection[]

  @Field(type => Int)
  total: number
}
