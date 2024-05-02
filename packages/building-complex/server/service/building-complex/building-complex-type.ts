import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'

import { ObjectRef, ScalarObject } from '@things-factory/shell'

import { BuildingComplex } from './building-complex'

@InputType()
export class BuildingComplexPatch {
  @Field({ nullable: false })
  id?: string

  @Field({ nullable: false })
  address: string

  @Field({ nullable: false })
  area: number

  @Field({ nullable: false })
  clientCompany: string

  @Field({ nullable: false })
  constructionCompany: string

  @Field({ nullable: false })
  supervisor: string

  @Field({ nullable: false })
  architect: string

  @Field({ nullable: true })
  mainPhoto?: string

  @Field({ nullable: false })
  constructionType: string

  @Field({ nullable: true })
  constructionCost?: number

  @Field({ nullable: true })
  etc?: string

  @Field({ nullable: true })
  householdCount?: number

  @Field({ nullable: true })
  buildingCount?: number
}
