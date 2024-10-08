import { CreateDateColumn, UpdateDateColumn, Entity, Index, Column, RelationId, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ObjectType, Field, ID, Int } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { ChecklistTemplate } from '../checklist-template/checklist-template'
import { ChecklistTypeMainType } from '../checklist-type/checklist-type'

@Entity({ comment: '체크리스트 템플릿 아이템' })
@Index('ix_checklist_template_item_0', (checklistTemplateItem: ChecklistTemplateItem) => [checklistTemplateItem.name], {
  unique: true
})
@Index('ix_checklist_template_item_1', (checklistTemplateItem: ChecklistTemplateItem) => [checklistTemplateItem.detailType])
@ObjectType()
export class ChecklistTemplateItem {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: false, comment: '검사 항목' })
  @Field({ nullable: false })
  name: string

  @Column({ nullable: true, comment: '검사 기준' })
  @Field({ nullable: true })
  inspctionCriteria?: string

  @Column({ nullable: true, comment: '시퀀스' })
  @Field(type => Int, { nullable: true })
  sequence?: number

  @Column({ nullable: false, comment: '메인 구분 (10: 기본 업무, 20: 기본 외 업무)' })
  @Field({ nullable: false })
  mainType: ChecklistTypeMainType

  @Column({ nullable: false, comment: '상세 구분 ID (F.K)' })
  @Field({ nullable: false })
  detailType: string

  // 체크리스트 템플릿 정보 (상위 테이블 참조)
  @ManyToOne(type => ChecklistTemplate)
  @Field(type => ChecklistTemplate, { nullable: true })
  checklistTemplate?: ChecklistTemplate

  @RelationId((checklistTemplateItem: ChecklistTemplateItem) => checklistTemplateItem.checklistTemplate)
  checklistTemplateId?: string

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((checklistTemplateItem: ChecklistTemplateItem) => checklistTemplateItem.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((checklistTemplateItem: ChecklistTemplateItem) => checklistTemplateItem.updater)
  updaterId?: string
}
