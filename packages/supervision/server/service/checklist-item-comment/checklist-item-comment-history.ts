import { Field, ID, ObjectType } from 'type-graphql'
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm'
import { HistoryActionColumn, HistoryActionType, HistoryEntityInterface, HistoryOriginalIdColumn } from '@operato/typeorm-history'
import { User } from '@things-factory/auth-base'
import { config } from '@things-factory/env'
import { ChecklistItemComment } from './checklist-item-comment'
import { ChecklistItem } from '../checklist-item/checklist-item'

const ORMCONFIG = config.get('ormconfig', {})
const DATABASE_TYPE = ORMCONFIG.type

@Entity()
@Index('ix_checklist-item-comment_history_0', (checklistItemCommentHistory: ChecklistItemCommentHistory) => [
  checklistItemCommentHistory.originalId
])
@Index('ix_checklist-item-comment_history_1', (checklistItemCommentHistory: ChecklistItemCommentHistory) => [
  checklistItemCommentHistory.checklistItem
])
@ObjectType({ description: 'History Entity of ChecklistItemComment' })
export class ChecklistItemCommentHistory implements HistoryEntityInterface<ChecklistItemComment> {
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

  @Column({ nullable: true })
  @Field({ nullable: true })
  createdAt?: Date

  @Column({ nullable: true })
  @Field({ nullable: true })
  deletedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((checklistItemComment: ChecklistItemComment) => checklistItemComment.creator)
  creatorId?: string

  @HistoryOriginalIdColumn()
  public originalId!: string

  @HistoryActionColumn({
    nullable: false,
    type:
      DATABASE_TYPE == 'postgres' || DATABASE_TYPE == 'mysql' || DATABASE_TYPE == 'mariadb'
        ? 'enum'
        : DATABASE_TYPE == 'oracle'
          ? 'varchar2'
          : DATABASE_TYPE == 'mssql'
            ? 'nvarchar'
            : 'varchar',
    enum: DATABASE_TYPE == 'postgres' || DATABASE_TYPE == 'mysql' || DATABASE_TYPE == 'mariadb' ? HistoryActionType : undefined,
    length: DATABASE_TYPE == 'postgres' || DATABASE_TYPE == 'mysql' || DATABASE_TYPE == 'mariadb' ? undefined : 32
  })
  public action!: HistoryActionType
}
