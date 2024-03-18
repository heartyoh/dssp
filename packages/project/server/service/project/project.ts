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
import { Task } from '../task/task'

export enum ProjectStatus {
  STATUS_A = 'STATUS_A',
  STATUS_B = 'STATUS_B'
}

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
  description: 'state enumeration of a project'
})

@Entity()
@Index('ix_project_0', (project: Project) => [project.domain, project.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: 'Entity for Project' })
export class Project {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((project: Project) => project.domain)
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
  state?: ProjectStatus

  @Column({ nullable: true })
  @Field({ nullable: true })
  params?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  startDate: Date

  @Column({ nullable: true })
  @Field({ nullable: true })
  endDate: Date

  @Field(() => [Task], { nullable: true })
  @OneToMany(() => Task, task => task.project)
  tasks: Task[]

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

  @RelationId((project: Project) => project.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((project: Project) => project.updater)
  updaterId?: string

  @Field(type => String, { nullable: true })
  thumbnail?: string
}
