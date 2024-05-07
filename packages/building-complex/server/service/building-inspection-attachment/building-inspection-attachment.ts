import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  RelationId,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { BuildingInspection } from '../building-inspection/building-inspection'

@Entity()
@Index(
  'ix_building_inspection_attachment_0',
  (buildingInspectionAttachment: BuildingInspectionAttachment) => [buildingInspectionAttachment.buildingInspection],
  { where: '"deleted_at" IS NULL' }
)
@ObjectType({ description: '시공 검측 첨부 파일' })
export class BuildingInspectionAttachment {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  // 시공 검측 정보 (상위 테이블 참조)
  @ManyToOne(type => BuildingInspection)
  @Field({ nullable: true })
  buildingInspection?: BuildingInspection

  @RelationId(
    (buildingInspectionAttachment: BuildingInspectionAttachment) => buildingInspectionAttachment.buildingInspection
  )
  buildingInspectionId?: string

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

  @RelationId((buildingInspectionAttachment: BuildingInspectionAttachment) => buildingInspectionAttachment.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((buildingInspectionAttachment: BuildingInspectionAttachment) => buildingInspectionAttachment.updater)
  updaterId?: string
}
