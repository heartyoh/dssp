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
  PrimaryGeneratedColumn,
  VersionColumn
} from 'typeorm'
import { ObjectType, Field, Int, ID, registerEnumType } from 'type-graphql'

import { Domain, roundTransformer } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Task } from '../task/task'
import { BuildingComplex } from '@dssp/building-complex/dist-server'

export enum ProjectStatus {
  'PROCEEDING' = '10',
  'COMPLICATED' = '20'
}

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
  description: '프로젝트 상태'
})

@Entity()
@Index('ix_project_0', (project: Project) => [project.domain, project.name], {
  where: '"deleted_at" IS NULL'
})
@ObjectType({ description: '프로젝트' })
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

  @Column({ nullable: true, default: ProjectStatus.PROCEEDING, comment: '프로젝트 상태 (10: 진행중, 20: 완료)' })
  @Field({ nullable: true })
  state?: ProjectStatus

  @Column({ nullable: true, comment: '착공일정' })
  @Field({ nullable: true })
  startDate?: Date

  @Column({ nullable: true, comment: '준공일정' })
  @Field({ nullable: true })
  endDate?: Date

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

  @OneToOne(type => BuildingComplex)
  @Field()
  buildingComplex?: BuildingComplex

  @RelationId((project: Project) => project.buildingComplex)
  buildingComplexId?: string

  // 작업 정보 (하위 테이블 참조)
  @Field(() => [Task], { nullable: true })
  @OneToMany(() => Task, task => task.project)
  tasks?: Task[]

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
