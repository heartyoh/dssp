import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { Project, ProjectStatus } from './project'
import { BuildingComplex } from '../../../../building-complex/server/service/building-complex/building-complex'
import { Building } from '../../../../building-complex/server/service/building/building'

@InputType()
export class ProjectPatch {
  @Field()
  project: Project

  @Field()
  buildingComplex: BuildingComplex

  @Field()
  buildings: Building[]
}
