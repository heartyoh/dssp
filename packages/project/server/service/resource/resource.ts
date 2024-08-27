import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  RelationId,
  OneToMany
} from 'typeorm'
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'
import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { TaskResource } from '../task-resource/task-resource'

export enum ResourceType {
  HUMAN = 'HUMAN',
  MATERIAL = 'MATERIAL',
  EQUIPMENT = 'EQUIPMENT'
}

registerEnumType(ResourceType, {
  name: 'ResourceType',
  description: '자원 유형'
})

@Entity()
@ObjectType({ description: '자원' })
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((resource: Resource) => resource.domain)
  domainId?: string

  @Column({ nullable: false, comment: '자원 이름' })
  @Field({ nullable: false })
  name?: string

  @Column({ nullable: false, default: ResourceType.HUMAN, comment: '자원 유형' })
  @Field({ nullable: false })
  type: ResourceType

  @Column({ nullable: false, comment: '단위 (예: man/day, kg, hour 등)' })
  @Field({ nullable: false })
  unit: string

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

  @RelationId((resource: Resource) => resource.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((resource: Resource) => resource.updater)
  updaterId?: string

  @OneToMany(() => TaskResource, taskResource => taskResource.resource)
  taskResources?: TaskResource[]
}
