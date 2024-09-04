import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { Inspection, InspectionStatus } from './inspection'
// import { InspectionAttachmentPatch } from '../inspection-attachment/inspection-attachment'

@InputType()
export class InspectionPatch {
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
export class InspectionSummary {
  @Field(type => Int, { description: '검사 요청 수' })
  request: number

  @Field(type => Int, { description: '검사 통과 수' })
  pass: number

  @Field(type => Int, { description: '검사 실패 수' })
  fail: number
}
