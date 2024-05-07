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
import { ObjectType, Field, Int, ID, registerEnumType } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { BuildingComplex } from '../building-complex/building-complex'
import { BuildingLevel } from '../building-level/building-level'

@Entity()
@Index('ix_building_0', (building: Building) => [building.buildingComplex], { where: '"deleted_at" IS NULL' })
@ObjectType({ description: '동 정보' })
export class Building {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: true, comment: '동 이름(101, 102...)' })
  @Field({ nullable: true })
  name: string

  @Column({ nullable: true, comment: '층 개수' })
  @Field({ nullable: true })
  floorCount: number

  @Column({ nullable: true, comment: '동 도면 이미지 링크' })
  @Field({ nullable: true })
  planImage: string

  @Field(() => BuildingComplex)
  @ManyToOne(() => BuildingComplex, buildingComplex => buildingComplex.buildings)
  buildingComplex: BuildingComplex

  @RelationId((building: Building) => building.buildingComplex)
  buildingComplexId?: string

  @Field(() => [BuildingLevel], { nullable: true })
  @OneToMany(() => BuildingLevel, buildingLevel => buildingLevel.building)
  buildingLevels: BuildingLevel[]

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
}
