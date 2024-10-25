import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  Column,
  RelationId,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'

import { ScalarObject } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from '../project/project'
// import { Checklist } from '@dssp/supervisor'
import { TaskResource } from '../task-resource/task-resource'

export enum TaskType {
  GROUP = 'group',
  TASK = 'task'
}

registerEnumType(TaskType, {
  name: 'TaskType',
  description: '작업 타입'
})

@Entity()
@Index('ix_task_project_code', (task: Task) => [task.project, task.code], { unique: true, where: '"deleted_at" IS NULL' })
@ObjectType({ description: '공정표 작업 정보' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: false, comment: '프로젝트 내에서 유니크한 작업 코드' })
  @Field({ nullable: false })
  code: string

  @Column({ nullable: true, comment: '작업 명' })
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true, comment: '테스크 타입 (group: 공종, task: 세부 공종)' })
  @Field({ nullable: true })
  type?: TaskType

  @ManyToOne(type => Task, task => task.children, { nullable: true })
  @Field({ nullable: true })
  parent: Task

  @RelationId((task: Task) => task.parent)
  parentId?: string

  @OneToMany(type => Task, task => task.parent, { nullable: true })
  @Field(type => [Task], { nullable: true })
  children?: Task[]

  @Column({ nullable: true, comment: '시작일' })
  @Field({ nullable: true })
  startDate?: Date

  @Column({ nullable: true, comment: '종료일' })
  @Field({ nullable: true })
  endDate?: Date

  @Column({ nullable: true, comment: '기간' })
  @Field({ nullable: true })
  duration?: number

  @Column({ nullable: true, comment: '선행 태스크 코드' })
  @Field({ nullable: true })
  dependsOn?: string

  @ManyToOne(type => Project, project => project.tasks)
  @Field(type => Project)
  project?: Project

  @RelationId((task: Task) => task.project)
  projectId?: string

  @Column('simple-json', { nullable: true, default: null })
  @Field(type => ScalarObject, { nullable: true })
  tags?: string[]

  @Column({ nullable: true, comment: '진행율' })
  @Field({ nullable: true })
  progress?: number

  @Column({ nullable: true, comment: '스타일' })
  @Field({ nullable: true })
  style?: string

  // @OneToMany(type => Checklist, checklist => checklist.task, { nullable: true })
  // @Field(type => [Checklist], { nullable: true })
  // checklists?: Checklist[]

  @OneToMany(type => TaskResource, taskResource => taskResource.task, { cascade: true })
  @Field(type => [TaskResource], { nullable: true })
  taskResources?: TaskResource[]

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @DeleteDateColumn()
  @Field({ nullable: true })
  deletedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((task: Task) => task.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((task: Task) => task.updater)
  updaterId?: string
}
