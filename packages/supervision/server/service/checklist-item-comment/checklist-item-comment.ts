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
import { ChecklistItem } from '../checklist-item/checklist-item'

@Entity()
@Index(
  'ix_checklist_item_comment_0',
  (checklistItemComment: ChecklistItemComment) => [checklistItemComment.checklistItem, checklistItemComment.createdAt],
  {
    where: '"deleted_at" IS NULL'
  }
)
@ObjectType({ description: 'Entity for ChecklistItemComment' })
export class ChecklistItemComment {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: true, comment: '조치 사항 코멘트' })
  @Field({ nullable: true })
  comment?: string

  // 체크리스트 아이템 정보 (상위 테이블 참조)
  @ManyToOne(type => ChecklistItem)
  @Field(type => ChecklistItem, { nullable: true })
  checklistItem?: ChecklistItem

  @RelationId((checklistItemComment: ChecklistItemComment) => checklistItemComment.checklistItem)
  checklistItemId?: string

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @DeleteDateColumn()
  @Field({ nullable: true })
  deletedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((checklistItemComment: ChecklistItemComment) => checklistItemComment.creator)
  creatorId?: string
}
