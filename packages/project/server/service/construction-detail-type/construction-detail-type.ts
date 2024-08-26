import { CreateDateColumn, UpdateDateColumn, Entity, Index, Column, RelationId, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ObjectType, Field, ID, Int } from 'type-graphql'

import { User } from '@things-factory/auth-base'
import { ConstructionType } from '../construction-type/construction-type'

@Entity()
@Index('ix_construction_detail_type_0', (constructionDetailType: ConstructionDetailType) => [constructionDetailType.name], {
  unique: true
})
@ObjectType({ description: '세부 공종 타입' })
export class ConstructionDetailType {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: false, comment: '세부 공종 이름' })
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true, comment: '시퀀스' })
  @Field(type => Int, { nullable: true })
  sequence?: number

  // 공종 타입 (상위 테이블 참조)
  @ManyToOne(type => ConstructionType)
  @Field({ nullable: true })
  constructionType?: ConstructionType

  @RelationId((constructionDetailType: ConstructionDetailType) => constructionDetailType.constructionType)
  constructionTypeId?: string

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((constructionDetailType: ConstructionDetailType) => constructionDetailType.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((constructionDetailType: ConstructionDetailType) => constructionDetailType.updater)
  updaterId?: string
}
