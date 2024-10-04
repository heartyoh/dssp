import { Field, ID, ObjectType } from 'type-graphql'
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm'
import { HistoryActionColumn, HistoryActionType, HistoryEntityInterface, HistoryOriginalIdColumn } from '@operato/typeorm-history'
import { User } from '@things-factory/auth-base'
import { config } from '@things-factory/env'
import { Checklist } from './checklist'

const ORMCONFIG = config.get('ormconfig', {})
const DATABASE_TYPE = ORMCONFIG.type

@Entity()
@Index('ix_checklist_history_0', (checklistHistory: ChecklistHistory) => [checklistHistory.originalId])
@ObjectType({ description: 'History Entity of Checklist' })
export class ChecklistHistory implements HistoryEntityInterface<Checklist> {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: true, comment: '이름' })
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true, comment: '문서 번호 동(4자리)-층(3자리)-시퀀스(6자리)' })
  @Field({ nullable: true })
  documentNo?: string

  @Column({ nullable: false, comment: '공종' })
  @Field({ nullable: true })
  constructionType?: string

  @Column({ nullable: false, comment: '세부 공종' })
  @Field({ nullable: true })
  constructionDetailType?: string

  @Column({ nullable: false, comment: '위치 (x동 x층)' })
  @Field({ nullable: true })
  location?: string

  @Column({ nullable: false, comment: '검측 도면 타입', default: '' })
  @Field({ nullable: true })
  inspectionDrawingType?: string

  @Column('simple-array', { nullable: true, comment: '검측 부위' })
  @Field(() => [String], { nullable: true })
  inspectionParts?: string[]

  @Column({ nullable: true, comment: '시공자 점검일' })
  @Field({ nullable: true })
  constructionInspectionDate?: Date

  @Column({ nullable: true, comment: '감리자 점검일' })
  @Field({ nullable: true })
  supervisorInspectionDate?: Date

  @Column({ nullable: true, comment: '총괄 시공 책임자 사인' })
  @Field({ nullable: true })
  overallConstructorSignature?: string

  @Column({ nullable: true, comment: '공종별 시공 관리자 사인' })
  @Field({ nullable: true })
  taskConstructorSignature?: string

  @Column({ nullable: true, comment: '총괄 감리 책임자 사인' })
  @Field({ nullable: true })
  overallSupervisorySignature?: string

  @Column({ nullable: true, comment: '건축사보 (공종별 감리 관리자) 사인' })
  @Field({ nullable: true })
  taskSupervisorySignature?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  createdAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((checklistHistory: ChecklistHistory) => checklistHistory.creator)
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
          : 'smallint',
    enum: HistoryActionType
  })
  public action!: HistoryActionType
}
