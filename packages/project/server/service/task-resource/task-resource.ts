import {
  Entity,
  PrimaryGeneratedColumn,
  RelationId,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { Task } from '../task/task'
import { Resource } from '../resource/resource'

@Entity()
@ObjectType({ description: '작업에 소요되는 자원' })
export class TaskResource {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(() => Task, task => task.taskResources, { nullable: false })
  @Field(type => Task)
  task: Task

  @RelationId((taskResource: TaskResource) => taskResource.task)
  taskId: string

  @ManyToOne(() => Resource, resource => resource.taskResources, { nullable: false })
  @Field(type => Resource)
  resource: Resource

  @RelationId((taskResource: TaskResource) => taskResource.resource)
  resourceId: string

  @Column({ type: 'float', nullable: false, comment: '소요량 (예: 8, 5 등)' })
  @Field({ nullable: false })
  quantity: number

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @DeleteDateColumn()
  @Field({ nullable: true })
  deletedAt?: Date
}
