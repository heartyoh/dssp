import { CreateDateColumn, UpdateDateColumn, Entity, Index, Column, RelationId, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ObjectType, Field, ID, Int } from 'type-graphql'
import { User } from '@things-factory/auth-base'
import { ChecklistType } from '../checklist-type/checklist-type'

@Entity()
@Index('ix_checklist_type_detail_0', (checklistTypeDetail: ChecklistTypeDetail) => [checklistTypeDetail.name], {
  unique: true
})
@ObjectType({ description: 'Entity for ChecklistTypeDetail' })
export class ChecklistTypeDetail {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column()
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true })
  @Field(type => Int, { nullable: true })
  sequence?: number

  // 체크리스트 구분 정보 (상위 테이블 참조)
  @ManyToOne(type => ChecklistType)
  @Field({ nullable: true })
  checklistType?: ChecklistType

  @RelationId((checklistTypeDetail: ChecklistTypeDetail) => checklistTypeDetail.checklistType)
  checklistTypeId?: string

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((checklistTypeDetail: ChecklistTypeDetail) => checklistTypeDetail.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((checklistTypeDetail: ChecklistTypeDetail) => checklistTypeDetail.updater)
  updaterId?: string
}
