import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { BuildingInspection, BuildingInspectionStatus } from './building-inspection'

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
class ChecklistSubmitInputType {
  @Field({ nullable: false })
  id: string

  @Field({ nullable: true })
  overallConstructorSignature?: string

  @Field({ nullable: true })
  taskConstructorSignature?: string

  @Field({ nullable: true })
  overallSupervisorySignature?: string

  @Field({ nullable: true })
  taskSupervisorySignature?: string
}

@InputType()
class ChecklistItemSubmitInputType {
  @Field({ nullable: false })
  id: string

  @Field({ nullable: true })
  constructionConfirmStatus?: string

  @Field({ nullable: true })
  supervisoryConfirmStatus?: string
}

@InputType()
export class UpdateBuildingInspectionSubmitType {
  @Field({ nullable: false })
  id: string

  @Field(type => ChecklistSubmitInputType, { nullable: false })
  checklist: ChecklistSubmitInputType

  @Field(type => [ChecklistItemSubmitInputType], { nullable: false })
  checklistItem: ChecklistItemSubmitInputType[]
}
@InputType()
export class UpdateBuildingInspectionDrawingMarker {
  @Field({ nullable: false })
  id: string

  @Field(type => String, { nullable: true })
  drawingMarker?: string
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
  @Field(type => String, { nullable: true, description: '요청일자' })
  requestDate?: string

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
