import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  Column,
  RelationId,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { Checklist } from '../checklist/checklist'

@Entity()
@Index('ix_check_item_0', (checkItem: CheckItem) => [checkItem.checklist], { where: '"deleted_at" IS NULL' })
@ObjectType({ description: '체크 리스트 항목' })
export class CheckItem {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: true, comment: '검사 항목' })
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: false, comment: '구분 (텍스트)' })
  @Field({ nullable: false })
  type?: string

  @Column({ nullable: false, comment: '상세 구분 (텍스트)' })
  @Field({ nullable: false })
  detailType?: string

  @Column({ nullable: true, comment: '시공 관리자 적합 여부 (T: 적합, F: 부적합)' })
  @Field({ nullable: true })
  constructionConfirmStatus?: string

  @Column({ nullable: true, comment: '감리 관리자 적합 여부 (T: 적합, F: 부적합)' })
  @Field({ nullable: true })
  supervisoryConfirmStatus?: string

  @Column({ nullable: true, comment: '조치 사항' })
  @Field({ nullable: true })
  action?: string

  @Column({ nullable: true, comment: '참고 사항' })
  @Field({ nullable: true })
  comment?: string

  // 체크리스트 정보 (상위 테이블 참조)
  @ManyToOne(type => Checklist)
  @Field({ nullable: true })
  checklist?: Checklist

  @RelationId((checkItem: CheckItem) => checkItem.checklist)
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

  @RelationId((checkItem: CheckItem) => checkItem.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((checkItem: CheckItem) => checkItem.updater)
  updaterId?: string
}
