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
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { Task } from '../task/task'
import { ChecklistItem } from '../checklist-item/checklist-item'
import { Inspection } from '../inspection/inspection'

@Entity()
@Index('ix_checklist_0', (checklist: Checklist) => [checklist.task], { where: '"deleted_at" IS NULL' })
@ObjectType({ description: '체크리스트' })
export class Checklist {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: true, comment: '이름' })
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true, comment: '문서 번호' })
  @Field({ nullable: true })
  documentNo?: string

  @Column({ nullable: true, comment: '부위' })
  @Field({ nullable: true })
  part?: string

  @Column({ nullable: true, comment: '위치' })
  @Field({ nullable: true })
  location?: string

  @Column({ nullable: true, comment: '시공자 점검일' })
  @Field({ nullable: true })
  constructionInspectorDate?: Date

  @Column({ nullable: true, comment: '감리자 점검일' })
  @Field({ nullable: true })
  supervisorInspectorDate?: Date

  @Column({ nullable: true, comment: '총괄 시공 책임자 사인' })
  @Field({ nullable: true })
  overallConstructionSignature?: string

  @Column({ nullable: true, comment: '공종별 시공 관리자 사인' })
  @Field({ nullable: true })
  taskConstructionSignature?: string

  @Column({ nullable: true, comment: '총괄 감리 책임자 사인' })
  @Field({ nullable: true })
  overallSupervisorySignature?: string

  @Column({ nullable: true, comment: '건축사보 (공종별 감리 관리자) 사인' })
  @Field({ nullable: true })
  taskSupervisorySignature?: string

  // 공정표 작업 정보 (상위 테이블 참조)
  @ManyToOne(() => Task, task => task.checklists)
  @Field(() => Task)
  task?: Task

  @RelationId((checklist: Checklist) => checklist.task)
  taskId?: string

  // 체크리스트 아이템 정보 (하위 테이블 참조)
  @OneToMany(() => ChecklistItem, checklistItem => checklistItem.checklist)
  @Field(() => ChecklistItem)
  checklistItems?: ChecklistItem[]

  // 검측 정보 (1:1 테이블 참조)
  @OneToOne(type => Inspection, inspection => inspection.checklist)
  @Field({ nullable: true })
  inspection?: Inspection

  @RelationId((checklist: Checklist) => checklist.inspection)
  inspectionId?: string

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

  @RelationId((checklist: Checklist) => checklist.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((checklist: Checklist) => checklist.updater)
  updaterId?: string
}
