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
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { BuildingLevel } from '../building-level/building-level'
import { BuildingInspectionAttachment } from '../building-inspection-attachment/building-inspection-attachment'
import { Attachment } from '@things-factory/attachment-base'

export enum InspectionStatus {
  REQUEST = 'REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}

registerEnumType(InspectionStatus, {
  name: 'InspectionStatus',
  description: '검측 상태'
})

@Entity()
@Index('ix_building_inspection_0', (buildingInspection: BuildingInspection) => [buildingInspection.buildingLevel], {
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: '시공 검측 (층별 도면의 검측 리스트)' })
export class BuildingInspection {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: true, comment: '도면 X 좌표' })
  @Field({ nullable: true })
  indexX?: number

  @Column({ nullable: true, comment: '도면 Y 좌표' })
  @Field({ nullable: true })
  indexY?: number

  @Column({ nullable: true, comment: '상태(REQUEST: 요청, PASS: 합격, FAIL: 불합격)' })
  @Field({ nullable: true })
  status?: InspectionStatus

  @Column({ nullable: true, comment: '세부 사항' })
  @Field({ nullable: true })
  detail?: string

  // 층 정보 (상위 테이블 참조)
  @ManyToOne(type => BuildingLevel)
  @Field({ nullable: true })
  buildingLevel?: BuildingLevel

  @RelationId((buildingInspection: BuildingInspection) => buildingInspection.buildingLevel)
  buildingLevelId?: string

  // 시공 검측 첨부 파일 정보 (하위 테이블 참조)
  @OneToMany(
    () => BuildingInspectionAttachment,
    buildingInspectionAttachment => buildingInspectionAttachment.buildingInspection
  )
  @Field(() => [BuildingInspectionAttachment], { nullable: true })
  buildingInspectionAttachments?: BuildingInspectionAttachment[]

  @Field(type => [Attachment], { nullable: true })
  attachments: Attachment[]

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
