import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'

@InputType()
export class BuildingInspectionPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  checklistTemplateId?: string

  @Field({ nullable: true })
  constructionTypeId?: string

  @Field({ nullable: true })
  constructionDetailTypeId?: string

  @Field({ nullable: true })
  buildingId?: string

  @Field({ nullable: true })
  buildingLevelId?: string

  // @Field(type => [InspectionAttachmentPatch], { nullable: true })
  // buildingInspectionAttachments?: BuildingInspectionAttachmentPatch[]
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
