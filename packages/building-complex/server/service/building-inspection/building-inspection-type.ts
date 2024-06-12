import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { BuildingInspection, InspectionType } from './building-inspection'
import { BuildingInspectionAttachment } from '../building-inspection-attachment/building-inspection-attachment'

@InputType()
export class BuildingInspectionPatch {
  @Field(type => ID, { nullable: true })
  id?: string
  indexX?: number
  indexY?: number
  type?: InspectionType
  detail?: string
  buildingInspectionAttachments?: BuildingInspectionAttachment[]
}
