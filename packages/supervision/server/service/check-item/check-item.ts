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
  PrimaryGeneratedColumn,
  VersionColumn
} from 'typeorm'
import { ObjectType, Field, Int, ID, registerEnumType } from 'type-graphql'

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Task } from '@dssp/project'

import { Issue } from '../issue/issue'
import { Supervisor } from '../supervisor/supervisor'

export enum CheckItemStatus {
  STATUS_A = 'STATUS_A',
  STATUS_B = 'STATUS_B'
}

registerEnumType(CheckItemStatus, {
  name: 'CheckItemStatus',
  description: 'state enumeration of a checkItem'
})

@Entity()
@Index('ix_check_item_0', (checkItem: CheckItem) => [checkItem.domain, checkItem.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: 'Entity for CheckItem' })
export class CheckItem {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((checkItem: CheckItem) => checkItem.domain)
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
  state?: CheckItemStatus

  @Column({ nullable: true })
  @Field({ nullable: true })
  params?: string

  // @Field(() => Task)
  // @ManyToOne(() => Task, task => task.checkItems)
  // task: Task

  @Field(() => Supervisor)
  @ManyToOne(() => Supervisor, supervisor => supervisor.checkItems)
  supervisor: Supervisor

  @Field(() => [Issue])
  @OneToMany(() => Issue, issue => issue.checkItem)
  issues: Issue[]

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

  @RelationId((checkItem: CheckItem) => checkItem.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((checkItem: CheckItem) => checkItem.updater)
  updaterId?: string

  @Field(type => String, { nullable: true })
  thumbnail?: string
}
