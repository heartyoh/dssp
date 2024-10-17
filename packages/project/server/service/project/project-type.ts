import { ObjectType, Field, InputType, Int, Float } from 'type-graphql'
import { Project } from './project'
import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { ObjectRef, ScalarObject } from '@things-factory/shell'
import { BuildingComplexPatch } from '@dssp/building-complex'

@InputType()
export class NewProject {
  @Field({ nullable: false, description: '프로젝트 이름' })
  name: string

  @Field(type => ObjectRef, { nullable: true, description: '연관된 건물 복합체 정보 (선택 사항)' })
  buildingComplex?: ObjectRef
}

@InputType()
export class ProjectPatch {
  @Field({ nullable: false, description: '수정할 프로젝트의 ID' })
  id: string

  @Field({ nullable: false, description: '프로젝트 이름' })
  name: string

  @Field({ nullable: true, description: '프로젝트 착공일정' })
  startDate?: string

  @Field({ nullable: true, description: '프로젝트 준공일정' })
  endDate?: string

  @Field(type => GraphQLUpload, { nullable: true, description: '프로젝트 대표 사진 업로드' })
  mainPhotoUpload?: FileUpload

  @Field(type => Float, { nullable: true, description: '프로젝트 전체 진행현황 (%)' })
  totalProgress?: number

  @Field(type => Float, { nullable: true, description: '프로젝트 주간 진행현황 (%)' })
  weeklyProgress?: number

  @Field(type => Float, { nullable: true, description: '프로젝트 KPI' })
  kpi?: number

  @Field(type => Float, { nullable: true, description: '검측/통과 비율 (%)' })
  inspPassRate?: number

  @Field(type => Float, { nullable: true, description: '로봇 작업 진행율 (%)' })
  robotProgressRate?: number

  @Field(type => Float, { nullable: true, description: '구조 안전도 (%)' })
  structuralSafetyRate?: number

  @Field({ nullable: true })
  buildingComplex?: BuildingComplexPatch
}

@ObjectType()
export class ProjectList {
  @Field(type => [Project], { description: '프로젝트 리스트 항목들' })
  items: Project[]

  @Field(type => Int, { description: '전체 프로젝트 수' })
  total: number
}
