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

import { User } from '@things-factory/auth-base'
import { Project } from '../project/project'
import { Checklist } from '../checklist/checklist'
import { TaskResource } from '../task-resource/task-resource'

export enum TaskType {
  GROUP = 'GROUP',
  TASK = 'TASK'
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

  @Column({ nullable: true, comment: '테스크에 그룹(부모)가 있을 시 taskId' })
  @Field({ nullable: true })
  parentTaskId?: string

  @Column({ nullable: true, comment: '시작일' })
  @Field({ nullable: true })
  startDate?: Date

  @Column({ nullable: true, comment: '종료일' })
  @Field({ nullable: true })
  endDate?: Date

  @Field(() => Project)
  @ManyToOne(() => Project, project => project.tasks)
  project?: Project

  @RelationId((task: Task) => task.project)
  projectId?: string

  @Field(() => Checklist)
  @OneToMany(() => Checklist, checklist => checklist.task)
  checklists?: Checklist[]

  @OneToMany(() => TaskResource, taskResource => taskResource.task)
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
