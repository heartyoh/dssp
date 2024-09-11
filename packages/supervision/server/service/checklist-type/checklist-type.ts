import { CreateDateColumn, UpdateDateColumn, Entity, Index, Column, RelationId, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'
import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'

export enum ChecklistTypeMainType {
  BASIC = '10',
  NON_BASIC = '20'
}

registerEnumType(ChecklistTypeMainType, {
  name: 'ChecklistTypeMainType',
  description: '체크리스트 구분 메인 구분'
})

@Entity({ comment: '체크리스트 구분' })
@Index(
  'ix_checklist_type_0',
  (checklistType: ChecklistType) => [checklistType.domain, checklistType.mainType, checklistType.detailType],
  { unique: true }
)
@ObjectType()
export class ChecklistType {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((checklistType: ChecklistType) => checklistType.domain)
  domainId?: string

  @Column({ nullable: false, comment: '메인 구분 (10: 기본 업무, 20: 기본 외 업무)' })
  @Field({ nullable: false })
  mainType: ChecklistTypeMainType

  @Column({ nullable: false, comment: '상세 구분' })
  @Field({ nullable: false })
  detailType: string

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((checklistType: ChecklistType) => checklistType.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((checklistType: ChecklistType) => checklistType.updater)
  updaterId?: string
}
