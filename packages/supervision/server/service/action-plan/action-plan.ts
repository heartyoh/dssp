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
import { Issue } from '../issue/issue'

export enum ActionPlanStatus {
  STATUS_A = 'STATUS_A',
  STATUS_B = 'STATUS_B'
}

registerEnumType(ActionPlanStatus, {
  name: 'ActionPlanStatus',
  description: 'state enumeration of a actionPlan'
})

@Entity()
@Index('ix_action_plan_0', (actionPlan: ActionPlan) => [actionPlan.domain, actionPlan.name], {
  unique: true,
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: 'Entity for ActionPlan' })
export class ActionPlan {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((actionPlan: ActionPlan) => actionPlan.domain)
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
  state?: ActionPlanStatus

  @Column({ nullable: true })
  @Field({ nullable: true })
  params?: string

  @Field(() => Issue)
  @ManyToOne(() => Issue, issue => issue.actionPlans)
  issue: Issue

  @Column({ nullable: true })
  @Field({ nullable: true })
  content: string

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

  @RelationId((actionPlan: ActionPlan) => actionPlan.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((actionPlan: ActionPlan) => actionPlan.updater)
  updaterId?: string

  @Field(type => String, { nullable: true })
  thumbnail?: string
}
