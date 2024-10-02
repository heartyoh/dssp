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

  @Field({ nullable: false })
  inspectionDrawingType?: string

  @Field(type => [String], { nullable: false })
  inspectionParts?: string[]
}

@InputType()
class ChecklistItemInputType {
  @Field({ nullable: false })
  name: string

  @Field({ nullable: false })
  mainType: string

  @Field({ nullable: false })
  detailType: string

  @Field({ nullable: true })
  inspctionCriteria: string
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

@InputType()
export class BuildingInspectionsOfProject {
  @Field({ nullable: false })
  projectId: string

  @Field({ nullable: true })
  limit: number
}

@InputType()
export class BuildingInspectionsOfBuildingLevel {
  @Field({ nullable: false })
  buildingLevelId: string

  @Field({ nullable: true })
  limit: number
}

@ObjectType()
export class BuildingInspectionSummary {
  @Field(type => Int, { description: '검측 대기 수' })
  wait: number

  @Field(type => Int, { description: '검측 요청 수' })
  request: number

  @Field(type => Int, { description: '검측 통과 수' })
  pass: number

  @Field(type => Int, { description: '검측 실패 수' })
  fail: number
}

@ObjectType()
export class BuildingInspectionList {
  @Field(type => [BuildingInspection])
  items: BuildingInspection[]

  @Field(type => Int)
  total: number
}
