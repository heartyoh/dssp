import { CreateDateColumn, UpdateDateColumn, Entity, Index, Column, RelationId, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'

@Entity()
@Index('ix_worker_type_0', (workerType: WorkerType) => [workerType.domain, workerType.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: '작업자 타입' })
export class WorkerType {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((workerType: WorkerType) => workerType.domain)
  domainId?: string

  @Column({ nullable: false, comment: '타입 이름' })
  @Field({ nullable: false })
  name: string

  @Column({ nullable: true, comment: '설명' })
  @Field({ nullable: true })
  description?: string

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((workerType: WorkerType) => workerType.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((workerType: WorkerType) => workerType.updater)
  updaterId?: string
}
