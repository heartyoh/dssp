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
import { Building } from '../building/building'
import { BuildingInspection } from '../building-inspection/building-inspection'

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
  floor: number

  // @Column({ nullable: true, comment: '층 도면 이미지 링크' })
  // 층 도면 이미지 링크
  @Field({ nullable: true })
  planImage: string

  // 동 정보 (상위 테이블 참조)
  @Field(() => Building)
  @ManyToOne(() => Building, building => building.buildingLevels)
  building: Building

  @RelationId((buildingLevel: BuildingLevel) => buildingLevel.building)
  buildingId?: string

  // 시공 검측 정보 (하위 테이블 참조)
  @OneToMany(() => BuildingInspection, buildingInspection => buildingInspection.buildingLevel)
  @Field(() => [BuildingInspection], { nullable: true })
  buildingInspections?: BuildingInspection[]

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @DeleteDateColumn()
  @Field({ nullable: true })
  deletedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((buildingLevel: BuildingLevel) => buildingLevel.creator)
  creatorId?: string
}
