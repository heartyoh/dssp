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

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Building } from '../building/building'

export enum BuildingLevelStatus {
  STATUS_A = 'STATUS_A',
  STATUS_B = 'STATUS_B'
}

registerEnumType(BuildingLevelStatus, {
  name: 'BuildingLevelStatus',
  description: 'state enumeration of a buildingLevel'
})

@Entity()
@Index('ix_building_level_0', (buildingLevel: BuildingLevel) => [buildingLevel.domain, buildingLevel.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: 'Entity for BuildingLevel' })
export class BuildingLevel {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((buildingLevel: BuildingLevel) => buildingLevel.domain)
  domainId?: string

  @Column()
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  number: number // 층 번호 (예: 1, -1 등)

  @Column({ nullable: true })
  @Field({ nullable: true })
  active?: boolean

  @Column({ nullable: true })
  @Field({ nullable: true })
  state?: BuildingLevelStatus

  @Column({ nullable: true })
  @Field({ nullable: true })
  params?: string

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

  @Field(type => String, { nullable: true })
  thumbnail?: string
}
