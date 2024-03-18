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
  VersionColumn
} from 'typeorm'
import { ObjectType, Field, Int, ID, registerEnumType } from 'type-graphql'

import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from '@dssp/project'

import { Supervisor } from '../supervisor/supervisor'

export enum ProjectReportStatus {
  STATUS_A = 'STATUS_A',
  STATUS_B = 'STATUS_B'
}

registerEnumType(ProjectReportStatus, {
  name: 'ProjectReportStatus',
  description: 'state enumeration of a projectReport'
})

@Entity()
@Index('ix_project_report_0', (projectReport: ProjectReport) => [projectReport.domain, projectReport.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: 'Entity for ProjectReport' })
export class ProjectReport {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((projectReport: ProjectReport) => projectReport.domain)
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
  state?: ProjectReportStatus

  @Column({ nullable: true })
  @Field({ nullable: true })
  params?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  content?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  date?: Date

  @Field(() => Project)
  @ManyToOne(() => Project)
  project?: Project

  @Field(() => Supervisor)
  @ManyToOne(() => Supervisor, supervisor => supervisor.reports)
  supervisor: Supervisor

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

  @RelationId((projectReport: ProjectReport) => projectReport.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((projectReport: ProjectReport) => projectReport.updater)
  updaterId?: string

  @Field(type => String, { nullable: true })
  thumbnail?: string
}
