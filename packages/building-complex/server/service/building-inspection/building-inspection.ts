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
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { BuildingLevel } from '../building-level/building-level'

export enum InspectionType {
  COMPLETED = 'COMPLETED',
  WARNING = 'WARNING',
  QUESTION = 'QUESTION'
}

registerEnumType(InspectionType, {
  name: 'InspectionType',
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

  @Column({ nullable: true, comment: '상태(완료: completed, 경고: warning, 문의: question)' })
  @Field({ nullable: true })
  type?: InspectionType

  @Column({ nullable: true, comment: '세부 사항' })
  @Field({ nullable: true })
  detail?: string

  @ManyToOne(type => BuildingLevel)
  @Field({ nullable: true })
  buildingLevel?: BuildingLevel

  @RelationId((buildingInspection: BuildingInspection) => buildingInspection.buildingLevel)
  buildingLevelId?: string

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
