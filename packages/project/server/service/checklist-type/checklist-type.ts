import {
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  Index,
  Column,
  RelationId,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistTypeDetail } from '../checklist-type-detail/checklist-type-detail'

@Entity()
@Index('ix_checklist_type_0', (checklistType: ChecklistType) => [checklistType.domain, checklistType.name], { unique: true })
@ObjectType({ description: 'Entity for ChecklistType' })
export class ChecklistType {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((checklistType: ChecklistType) => checklistType.domain)
  domainId?: string

  @Column()
  @Field({ nullable: true })
  name?: string

  // 체크리스트 구분 상세 정보 (하위 테이블 참조)
  @Field(() => ChecklistTypeDetail)
  @OneToMany(() => ChecklistTypeDetail, checklistTypeDetail => checklistTypeDetail.checklistType)
  checklistTypeDetails?: ChecklistTypeDetail[]

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((checklistType: ChecklistType) => checklistType.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((checklistType: ChecklistType) => checklistType.updater)
  updaterId?: string
}
