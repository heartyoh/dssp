import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  Column,
  RelationId,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { BuildingLevel } from '../building-level/building-level'
import { Attachment } from '@things-factory/attachment-base'
// import { Checklist } from '@dssp/supervision/checklist'

export enum BuildingInspectionStatus {
  REQUEST = 'REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}

registerEnumType(BuildingInspectionStatus, {
  name: 'BuildingInspectionStatus',
  description: '검측 상태'
})

@Entity()
@Index('ix_building_inspection_0', (buildingInspection: BuildingInspection) => [buildingInspection.buildingLevel], {
  where: '"deleted_at" IS NULL'
})
@Index('ix_building_inspection_1', (buildingInspection: BuildingInspection) => [buildingInspection.requestDate], {
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: '시공 검측 (층별 도면의 검측 리스트)' })
export class BuildingInspection {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: false, comment: '상태(REQUEST: 요청, PASS: 합격, FAIL: 불합격)' })
  @Field({ nullable: true })
  status?: BuildingInspectionStatus

  // 시공 검측 첨부 파일 정보 (하위 테이블 참조)
  // @OneToOne(() => Checklist, checklist => checklist.buildingInspection)
  // @Field(() => Checklist, { nullable: true })
  // checklist?: Checklist

  // 층 정보 (1:1 테이블 참조)
  @ManyToOne(type => BuildingLevel)
  @Field({ nullable: true })
  buildingLevel?: BuildingLevel

  @RelationId((buildingInspection: BuildingInspection) => buildingInspection.buildingLevel)
  buildingLevelId?: string

  @Column({ nullable: false, comment: '검측 요청일' })
  @Field({ nullable: true })
  requestDate?: Date

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

  @RelationId((buildingInspection: BuildingInspection) => buildingInspection.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((buildingInspection: BuildingInspection) => buildingInspection.updater)
  updaterId?: string
}
