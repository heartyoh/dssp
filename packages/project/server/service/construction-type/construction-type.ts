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
  OneToMany
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ConstructionDetailType } from '../construction-detail-type/construction-detail-type'

@Entity()
@Index('ix_construction_type_0', (constructionType: ConstructionType) => [constructionType.domain, constructionType.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: '공종 타입' })
export class ConstructionType {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((constructionType: ConstructionType) => constructionType.domain)
  domainId?: string

  @Column()
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string

  // 상세 공종 정보 (하위 테이블 참조)
  @Field(() => [ConstructionDetailType], { nullable: true })
  @OneToMany(() => ConstructionDetailType, constructionDetailType => constructionDetailType.constructionType)
  constructionDetailTypes?: ConstructionDetailType[]

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

  @RelationId((constructionType: ConstructionType) => constructionType.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((constructionType: ConstructionType) => constructionType.updater)
  updaterId?: string
}
