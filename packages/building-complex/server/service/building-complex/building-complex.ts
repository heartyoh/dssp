import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Column,
  RelationId,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'

import { Domain, roundTransformer } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Building } from '../building/building'

@Entity()
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

  @Column({ nullable: true, comment: '단지 주소' })
  @Field({ nullable: true })
  address?: string

  @Column({ type: 'float', nullable: true, default: 0, transformer: roundTransformer, comment: '면적 (㎡)' })
  @Field({ nullable: true })
  area?: number

  @Column({ type: 'float', nullable: true, default: 0, transformer: roundTransformer, comment: '위도' })
  @Field({ nullable: true })
  latitude?: number

  @Column({ type: 'float', nullable: true, default: 0, transformer: roundTransformer, comment: '경도' })
  @Field({ nullable: true })
  longitude?: number

  @Column({ nullable: true, comment: '발주처' })
  @Field({ nullable: true })
  clientCompany?: string

  @Column({ nullable: true, comment: '건설사' })
  @Field({ nullable: true })
  constructionCompany?: string

  @Column({ nullable: true, comment: '감리사' })
  @Field({ nullable: true })
  supervisoryCompany?: string

  @Column({ nullable: true, comment: '설계사' })
  @Field({ nullable: true })
  designCompany?: string

  // 대표 사진
  @Field(type => String, { nullable: true })
  mainPhoto?: string

  @Column({ nullable: true, comment: '건설 구분 (아파트, 공원)' })
  @Field({ nullable: true })
  constructionType?: string

  @Column({ nullable: true, comment: '공사 금액' })
  @Field({ nullable: true })
  constructionCost?: number

  @Column({ nullable: true, comment: '기타사항' })
  @Field({ nullable: true })
  etc?: string

  @Column({ nullable: true, comment: '세대 수' })
  @Field({ nullable: true })
  householdCount?: number

  @Column({ nullable: true, comment: '동 수' })
  @Field({ nullable: true })
  buildingCount?: number

  @Column({ nullable: true, comment: '공지사항' })
  @Field({ nullable: true })
  notice?: string

  @Column({ nullable: true, comment: '도면 X 축척' })
  @Field({ nullable: true })
  planXScale?: number

  @Column({ nullable: true, comment: '도면 Y 축척' })
  @Field({ nullable: true })
  planYScale?: number

  // 동 정보 (하위 테이블 참조)
  @OneToMany(() => Building, building => building.buildingComplex)
  @Field(() => [Building], { nullable: true })
  buildings?: Building[]

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
