import { CreateDateColumn, UpdateDateColumn, Entity, Index, Column, RelationId, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { ChecklistTemplate } from '../checklist-template/checklist-template'

@Entity()
@Index('ix_checklist_template_item_0', (checklistTemplateItem: ChecklistTemplateItem) => [checklistTemplateItem.name], {
  unique: true
})
@ObjectType({ description: 'Entity for ChecklistTemplateItem' })
export class ChecklistTemplateItem {
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

  // 체크리스트 템플릿 정보 (상위 테이블 참조)
  @ManyToOne(type => ChecklistTemplate)
  @Field({ nullable: true })
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
