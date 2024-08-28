import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  Column,
  RelationId,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'

import { Domain, roundTransformer } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Task } from '../task/task'
import { BuildingComplex } from '@dssp/building-complex'
import { Attachment } from '@things-factory/attachment-base'

export enum ProjectStatus {
  'ONGOING' = '10',
  'COMPLETED' = '20'
}

@ObjectType({ description: '프로젝트' })
@Entity()
@Index('ix_project_building', (project: Project) => [project.buildingComplex], { unique: true, where: '"deleted_at" IS NULL' })
export class Project {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((project: Project) => project.domain)
  domainId?: string

  @Column({ nullable: false, comment: '프로젝트 이름' })
  @Field({ nullable: false })
  name?: string

  @Column({ nullable: false, default: ProjectStatus.ONGOING, comment: '프로젝트 상태 (10: 진행중, 20: 완료)' })
  @Field({ nullable: false })
  state?: ProjectStatus

  @Column({ type: 'date', nullable: true, comment: '착공일정' })
  @Field({ nullable: true })
  startDate?: string

  @Column({ type: 'date', nullable: true, comment: '준공일정' })
  @Field({ nullable: true })
  endDate?: string

  // 대표 사진
  @Field(type => Attachment, { nullable: true })
  mainPhoto?: Attachment

  @Column({ type: 'float', nullable: true, default: 0, transformer: roundTransformer, comment: '전체 진행현황' })
  @Field({ nullable: true })
  totalProgress?: number

  @Column({ type: 'float', nullable: true, default: 0, transformer: roundTransformer, comment: '주간 진행현황' })
  @Field({ nullable: true })
  weeklyProgress?: number

  @Column({ type: 'float', nullable: true, default: 0, transformer: roundTransformer, comment: 'KPI' })
  @Field({ nullable: true })
  kpi?: number

  @Column({ type: 'float', nullable: true, default: 0, transformer: roundTransformer, comment: '검측/통과 비율' })
  @Field({ nullable: true })
  inspPassRate?: number

  @Column({ type: 'float', nullable: true, default: 0, transformer: roundTransformer, comment: '로봇 작업 진행율' })
  @Field({ nullable: true })
  robotProgressRate?: number

  @Column({ type: 'float', nullable: true, default: 0, transformer: roundTransformer, comment: '구조 안전도' })
  @Field({ nullable: true })
  structuralSafetyRate?: number

  // 단지 정보 (1:1 테이블 참조)
  @OneToOne(type => BuildingComplex)
  @JoinColumn()
  @Field({ nullable: true })
  buildingComplex?: BuildingComplex

  @RelationId((project: Project) => project.buildingComplex)
  buildingComplexId?: string

  // 작업 정보 (하위 테이블 참조)
  @Field(() => [Task], { nullable: true })
  @OneToMany(() => Task, task => task.project)
  tasks?: Task[]

  // 루트 작업 정보 (부모가 없는 상위 작업)
  @Field(() => [Task], { nullable: true })
  rootTasks?: Task[]

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
}
