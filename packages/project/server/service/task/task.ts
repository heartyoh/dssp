import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  Column,
  RelationId,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn
} from 'typeorm'
import { ObjectType, Field, Int, ID, registerEnumType } from 'type-graphql'

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from '../project/project'

export enum TaskStatus {
  STATUS_A = 'STATUS_A',
  STATUS_B = 'STATUS_B'
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'state enumeration of a task'
})

@Entity()
@Index('ix_task_0', (task: Task) => [task.domain, task.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: 'Entity for Task' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((task: Task) => task.domain)
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
  state?: TaskStatus

  @Column({ nullable: true })
  @Field({ nullable: true })
  params?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  startDate?: Date

  @Column({ nullable: true })
  @Field({ nullable: true })
  endDate?: Date

  @Field(() => [Task], { nullable: true })
  @ManyToMany(() => Task)
  @JoinTable()
  dependencies?: Task[]

  @Field(() => Project)
  @ManyToOne(() => Project, project => project.tasks)
  project?: Project

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

  @RelationId((task: Task) => task.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((task: Task) => task.updater)
  updaterId?: string

  @Field(type => String, { nullable: true })
  thumbnail?: string
}
