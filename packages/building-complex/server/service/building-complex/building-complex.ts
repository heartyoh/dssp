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
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'

import { Domain, roundTransformer } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from '@dssp/project'

import { Building } from '../building/building'

@Entity('단지 정보')
@ObjectType({ description: '단지 정보' })
export class BuildingComplex {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((buildingComplex: BuildingComplex) => buildingComplex.domain)
  domainId?: string

  @Column({ nullable: false, comment: '단지 주소' })
  @Field({ nullable: false })
  address: string

  @Column({ type: 'float', nullable: false, transformer: roundTransformer, comment: '면적 (㎡)' })
  @Field({ nullable: false })
  area: number

  @Column({ nullable: false, comment: '발주처' })
  @Field({ nullable: false })
  clientCompany: string

  @Column({ nullable: false, comment: '건설사' })
  @Field({ nullable: false })
  constructionCompany: string

  @Column({ nullable: false, comment: '감리사' })
  @Field({ nullable: false })
  supervisor: string

  @Column({ nullable: false, comment: '설계사' })
  @Field({ nullable: false })
  architect: string

  @Column({ nullable: true, comment: '대표 사진' })
  @Field({ nullable: true })
  mainPhoto: string

  @Column({ nullable: false, comment: '건설 구분 (아파트, 공원)' })
  @Field({ nullable: false })
  constructionType: string

  @Column({ nullable: true, comment: '공사 금액' })
  @Field({ nullable: true })
  constructionCost: number

  @Column({ nullable: true, comment: '기타사항' })
  @Field({ nullable: true })
  etc: string

  @Column({ nullable: true, comment: '세대 수' })
  @Field({ nullable: true })
  householdCount: number

  @Column({ nullable: true, comment: '동 수' })
  @Field({ nullable: true })
  buildingCount: number

  @Field(() => [Building], { nullable: true })
  @OneToMany(() => Building, building => building.buildingComplex)
  buildings: Building[]

  @Field(() => Project)
  @OneToOne(() => Project)
  project: Project

  @RelationId((buildingComplex: BuildingComplex) => buildingComplex.project)
  projectId?: string

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
}
