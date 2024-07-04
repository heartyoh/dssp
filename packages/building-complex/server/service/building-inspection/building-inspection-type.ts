import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { BuildingInspection, InspectionStatus } from './building-inspection'
// import { BuildingInspectionAttachmentPatch } from '../building-inspection-attachment/building-inspection-attachment'

@InputType()
export class BuildingInspectionPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  indexX?: number

  @Field({ nullable: true })
  indexY?: number

  @Field({ nullable: true })
  status?: InspectionStatus

  @Field({ nullable: true })
  detail?: string

  // @Field(type => [BuildingInspectionAttachmentPatch], { nullable: true })
  // buildingInspectionAttachments?: BuildingInspectionAttachmentPatch[]
}
