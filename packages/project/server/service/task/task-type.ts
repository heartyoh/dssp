import { ObjectType, Field, InputType, Int, ID, registerEnumType } from 'type-graphql'
import { ObjectRef, ScalarObject } from '@things-factory/shell'
import { Task } from './task'

@InputType()
export class ObjectRefForProject extends ObjectRef {
  @Field({ nullable: true, description: '프로젝트 이름 (선택 사항)' })
  name?: string
}

@InputType()
export class ObjectRefForTask extends ObjectRef {
  @Field({ nullable: true, description: '작업 코드 (선택 사항)' })
  code?: string
}

@InputType()
export class NewTask {
  @Field({ description: '프로젝트 내에서 유니크한 작업 코드' })
  code: string

  @Field({ description: '작업의 이름' })
  name: string

  @Field(type => ObjectRefForProject, { nullable: true, description: '작업이 속한 프로젝트 (선택 사항)' })
  project?: ObjectRefForProject

  @Field(type => ObjectRefForTask, { nullable: true, description: '부모 작업, 해당 작업이 하위 작업인 경우 (선택 사항)' })
  parent?: ObjectRefForTask

  @Field({ nullable: true, description: '작업에 대한 설명 (선택 사항)' })
  description?: string

  @Field({ nullable: true, description: '작업이 활성 상태인지 여부 (선택 사항)' })
  active?: boolean

  @Field({ nullable: true, description: '작업에 대한 추가 파라미터, JSON 형식으로 저장 (선택 사항)' })
  params?: string
}

@InputType()
export class TaskPatch {
  @Field(type => ID, { nullable: true, description: '수정할 작업의 ID (선택 사항)' })
  id?: string

  @Field({ nullable: true, description: '프로젝트 내에서 유니크한 작업 코드 (선택 사항)' })
  code?: string

  @Field({ nullable: true, description: '작업의 이름 (선택 사항)' })
  name?: string

  @Field(type => ObjectRefForProject, { nullable: true, description: '작업이 속한 프로젝트 (선택 사항)' })
  project?: ObjectRefForProject

  @Field(type => ObjectRefForTask, { nullable: true, description: '부모 작업, 해당 작업이 하위 작업인 경우 (선택 사항)' })
  parent?: ObjectRefForTask

  @Field({ nullable: true, description: '작업에 대한 설명 (선택 사항)' })
  description?: string

  @Field({ nullable: true, description: '작업이 활성 상태인지 여부 (선택 사항)' })
  active?: boolean

  @Field({ nullable: true, description: "생성('+') 또는 수정('M') 플래그 (선택 사항)" })
  cuFlag?: string
}

@ObjectType()
export class TaskList {
  @Field(type => [Task], { description: '작업 리스트 항목들' })
  items: Task[]

  @Field(type => Int, { description: '전체 작업 수' })
  total: number
}
