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

import { User } from '@things-factory/auth-base'
import { BuildingComplex } from '../building-complex/building-complex'
import { BuildingLevel } from '../building-level/building-level'
import { Attachment } from '@things-factory/attachment-base'
import { FileUpload } from 'graphql-upload/GraphQLUpload.js'

@Entity()
@Index('ix_building_0', (building: Building) => [building.buildingComplex, building.name], {
  where: '"deleted_at" IS NULL',
  unique: true
})
@ObjectType({ description: '동 정보' })
export class Building {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: true, comment: '동 이름(101, 102...)' })
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true, comment: '층 개수' })
  @Field({ nullable: true })
  floorCount?: number

  // 동 도면 이미지 BIM
  @Field(type => Attachment, { nullable: true })
  drawing?: Attachment

  // 단지 정보 (상위 테이블 참조)
  @Field(() => BuildingComplex, { nullable: true })
  @ManyToOne(() => BuildingComplex, buildingComplex => buildingComplex.buildings)
  buildingComplex?: BuildingComplex

  @RelationId((building: Building) => building.buildingComplex)
  buildingComplexId?: string

  // 층 정보 (하위 테이블 참조)
  @OneToMany(() => BuildingLevel, buildingLevel => buildingLevel.building)
  @Field(() => [BuildingLevel], { nullable: true })
  buildingLevels?: BuildingLevel[]

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

  @RelationId((building: Building) => building.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((building: Building) => building.updater)
  updaterId?: string

  drawingUpload: FileUpload
}
