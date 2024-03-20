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
  OneToOne,
  PrimaryGeneratedColumn,
  VersionColumn
} from 'typeorm'
import { ObjectType, Field, Int, ID, registerEnumType } from 'type-graphql'

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from '@dssp/project'

import { Building } from '../building/building'

export enum BuildingComplexStatus {
  STATUS_A = 'STATUS_A',
  STATUS_B = 'STATUS_B'
}

registerEnumType(BuildingComplexStatus, {
  name: 'BuildingComplexStatus',
  description: 'state enumeration of a building complex'
})

@Entity()
@Index('ix_building_complex_0', (buildingComplex: BuildingComplex) => [buildingComplex.domain, buildingComplex.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: 'Entity for BuildingComplex' })
export class BuildingComplex {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((buildingComplex: BuildingComplex) => buildingComplex.domain)
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
  state?: BuildingComplexStatus

  @Column({ nullable: true })
  @Field({ nullable: true })
  params?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  address: string

  @Field(() => [Building], { nullable: true })
  @OneToMany(() => Building, building => building.buildingComplex)
  buildings: Building[]

  @Field(() => Project)
  @OneToOne(() => Project)
  project: Project

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

  @RelationId((buildingComplex: BuildingComplex) => buildingComplex.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((buildingComplex: BuildingComplex) => buildingComplex.updater)
  updaterId?: string

  @Field(type => String, { nullable: true })
  thumbnail?: string
}
