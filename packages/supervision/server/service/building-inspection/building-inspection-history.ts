import { Field, ID, ObjectType } from 'type-graphql'
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm'

import { HistoryActionColumn, HistoryActionType, HistoryEntityInterface, HistoryOriginalIdColumn } from '@operato/typeorm-history'
import { User } from '@things-factory/auth-base'
import { config } from '@things-factory/env'

import { BuildingInspection, BuildingInspectionStatus } from './building-inspection'
import { BuildingLevel } from '@dssp/building-complex'

const ORMCONFIG = config.get('ormconfig', {})
const DATABASE_TYPE = ORMCONFIG.type

@Entity()
@Index('ix_buildingInspection_history_0', (buildingInspectionHistory: BuildingInspectionHistory) => [
  buildingInspectionHistory.originalId
])
@ObjectType({ description: 'History Entity of BuildingInspection' })
export class BuildingInspectionHistory implements HistoryEntityInterface<BuildingInspection> {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @HistoryOriginalIdColumn()
  public originalId!: string

  @Column({ nullable: false, comment: '상태(REQUEST: 요청, PASS: 합격, FAIL: 불합격)' })
  @Field({ nullable: true })
  status?: BuildingInspectionStatus

  // 층 정보 (1:1 테이블 참조)
  @ManyToOne(type => BuildingLevel)
  @Field({ nullable: true })
  buildingLevel?: BuildingLevel

  @RelationId((buildingInspectionHistory: BuildingInspectionHistory) => buildingInspectionHistory.buildingLevel)
  buildingLevelId?: string

  @Column({ nullable: false, comment: '검측 요청일' })
  @Field({ nullable: true })
  requestDate?: Date

  // 체크리스트 ID (1:1 테이블 참조)
  @Field({ nullable: true })
  @Column({ nullable: true, comment: '체크리스트 ID' })
  checklistId: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  createdAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((buildingInspectionHistory: BuildingInspectionHistory) => buildingInspectionHistory.creator)
  creatorId?: string

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
