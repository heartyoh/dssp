import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  Column,
  RelationId,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn
} from 'typeorm'
import { ObjectType, Field, Int, ID, registerEnumType } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { Building } from '../building/building'

@Entity()
@Index('ix_building_level_0', (buildingLevel: BuildingLevel) => [buildingLevel.building], {
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: '층 정보' })
export class BuildingLevel {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: false, comment: '층 번호 (예: 1, -1 등)' })
  @Field({ nullable: false })
  number: number

  @Column({ nullable: true, comment: '층 도면 이미지 링크' })
  @Field({ nullable: true })
  planImage: string

  @Field(() => Building)
  @ManyToOne(() => Building, building => building.buildingLevels)
  building: Building

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

  @RelationId((buildingLevel: BuildingLevel) => buildingLevel.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((buildingLevel: BuildingLevel) => buildingLevel.updater)
  updaterId?: string
}
