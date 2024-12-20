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
import { ObjectType, Field, ID, Int, registerEnumType } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { Checklist } from '../checklist/checklist'
import { ChecklistItemComment } from '../checklist-item-comment/checklist-item-comment'

export enum ChecklistItemConfirmStatus {
  T = '적합',
  F = '부적합'
}

registerEnumType(ChecklistItemConfirmStatus, {
  name: 'ChecklistItemConfirmStatus',
  description: '적합 상태'
})

@Entity({ comment: '체크 리스트 항목' })
@Index('ix_checklist_item_0', (checklistItem: ChecklistItem) => [checklistItem.checklist], { where: '"deleted_at" IS NULL' })
@ObjectType()
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: true, comment: '시퀀스' })
  @Field(type => Int, { nullable: true })
  sequence?: number

  @Column({ nullable: false, comment: '구분 (텍스트)' })
  @Field({ nullable: false })
  mainType?: string

  @Column({ nullable: false, comment: '상세 구분 (텍스트)' })
  @Field({ nullable: false })
  detailType?: string

  @Column({ nullable: true, comment: '검사 항목' })
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true, comment: '검사 기준' })
  @Field({ nullable: true })
  inspctionCriteria?: string

  @Column({ nullable: true, comment: '시공 관리자 적합 여부 (T: 적합, F: 부적합)' })
  @Field({ nullable: true })
  constructionConfirmStatus?: ChecklistItemConfirmStatus

  @Column({ nullable: true, comment: '감리 관리자 적합 여부 (T: 적합, F: 부적합)' })
  @Field({ nullable: true })
  supervisoryConfirmStatus?: ChecklistItemConfirmStatus

  // 조치 사항 정보 (하위 테이블 참조)
  @OneToMany(() => ChecklistItemComment, checklistItemComment => checklistItemComment.checklistItem)
  @Field(() => [ChecklistItemComment])
  checklistItemComments?: ChecklistItemComment[]

  // 체크리스트 정보 (상위 테이블 참조)
  @ManyToOne(type => Checklist)
  @Field(type => Checklist, { nullable: true })
  checklist?: Checklist

  @RelationId((checklistItem: ChecklistItem) => checklistItem.checklist)
  checklistId?: string

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

  @RelationId((checklistItem: ChecklistItem) => checklistItem.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((checklistItem: ChecklistItem) => checklistItem.updater)
  updaterId?: string
}
