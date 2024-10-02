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
  PrimaryGeneratedColumn,
  JoinColumn
} from 'typeorm'
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { BuildingLevel } from '@dssp/building-complex'
import { Checklist } from '../checklist/checklist'

export enum BuildingInspectionStatus {
  WAIT = 'WAIT',
  REQUEST = 'REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}

registerEnumType(BuildingInspectionStatus, {
  name: 'BuildingInspectionStatus',
  description: '검측 상태'
})

@Entity({ comment: '시공 검측 (층별 도면의 검측 리스트)' })
@Index('ix_building_inspection_0', (buildingInspection: BuildingInspection) => [buildingInspection.buildingLevel], {
  where: '"deleted_at" IS NULL'
})
@Index('ix_building_inspection_1', (buildingInspection: BuildingInspection) => [buildingInspection.checklist], {
  where: '"deleted_at" IS NULL'
})
@Index('ix_building_inspection_2', (buildingInspection: BuildingInspection) => [buildingInspection.requestDate], {
  where: '"deleted_at" IS NULL'
})
@ObjectType()
export class BuildingInspection {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({
    nullable: false,
    comment: '상태(WAIT: 검측 대기, REQUEST: 검측 요청, PASS: 합격, FAIL: 불합격)',
    default: 'WAIT'
  })
  @Field({ nullable: true })
  status?: BuildingInspectionStatus

  @Column({ nullable: false, comment: '검측 요청일' })
  @Field({ nullable: true })
  requestDate?: Date

  @Column({ type: 'simple-json', nullable: true, comment: '도면 마커' })
  @Field(type => String, { nullable: true })
  drawingMarker?: string

  // 층 정보 (1:1 상위 테이블 참조)
  @ManyToOne(type => BuildingLevel)
  @Field(() => BuildingLevel, { nullable: true })
  buildingLevel?: BuildingLevel

  @RelationId((buildingInspection: BuildingInspection) => buildingInspection.buildingLevel)
  buildingLevelId?: string

  // 체크리스트 (1:1 상위 테이블 참조)
  @OneToOne(type => Checklist)
  @JoinColumn()
  @Field(() => Checklist, { nullable: true })
  checklist?: Checklist

  @RelationId((buildingInspection: BuildingInspection) => buildingInspection.checklist)
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

  @RelationId((buildingInspection: BuildingInspection) => buildingInspection.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((buildingInspection: BuildingInspection) => buildingInspection.updater)
  updaterId?: string
}
