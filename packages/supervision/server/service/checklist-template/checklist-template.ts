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
import { ObjectType, Field, ID } from 'type-graphql'

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistTemplateItem } from '../checklist-template-item/checklist-template-item'

@Entity({ comment: '체크리스트 템플릿' })
@Index('ix_checklist_template_0', (checklistTemplate: ChecklistTemplate) => [checklistTemplate.domain, checklistTemplate.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType()
export class ChecklistTemplate {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((checklistTemplate: ChecklistTemplate) => checklistTemplate.domain)
  domainId?: string

  @Column({ nullable: true, comment: '이름' })
  @Field({ nullable: true })
  name?: string

  // 체크리스트 템플릿 아이템 정보 (하위 테이블 참조)
  @Field(() => ChecklistTemplateItem)
  @OneToMany(() => ChecklistTemplateItem, checklistTemplateItem => checklistTemplateItem.checklistTemplate)
  checklistTemplateItems?: ChecklistTemplateItem[]

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

  @RelationId((checklistTemplate: ChecklistTemplate) => checklistTemplate.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((checklistTemplate: ChecklistTemplate) => checklistTemplate.updater)
  updaterId?: string
}
