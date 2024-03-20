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

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingComplex } from '../building-complex/building-complex'
import { BuildingLevel } from '../building-level/building-level'

export enum BuildingStatus {
  STATUS_A = 'STATUS_A',
  STATUS_B = 'STATUS_B'
}

registerEnumType(BuildingStatus, {
  name: 'BuildingStatus',
  description: 'state enumeration of a building'
})

@Entity()
@Index('ix_building_0', (building: Building) => [building.domain, building.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: 'Entity for Building' })
export class Building {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((building: Building) => building.domain)
  domainId?: string

  @Column()
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  active?: boolean

  @Column({ nullable: true })
  @Field({ nullable: true })
  state?: BuildingStatus

  @Column({ nullable: true })
  @Field({ nullable: true })
  params?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  address: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  floors: number

  @Column({ nullable: true })
  @Field({ nullable: true })
  units: number

  @Field(() => BuildingComplex)
  @ManyToOne(() => BuildingComplex, buildingComplex => buildingComplex.buildings)
  buildingComplex: BuildingComplex

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

  @Field(type => String, { nullable: true })
  thumbnail?: string
}
