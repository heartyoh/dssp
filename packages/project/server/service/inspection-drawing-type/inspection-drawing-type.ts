import {
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  Index,
  Column,
  RelationId,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { User } from '@things-factory/auth-base'
import { Domain } from '@things-factory/shell'
import { InspectionPart } from '../inspection-part/inspection-part'

@Entity()
@Index(
  'ix_inspection_drawing_type_0',
  (inspectionDrawingType: InspectionDrawingType) => [inspectionDrawingType.domain, inspectionDrawingType.name],
  {
    unique: true
  }
)
@ObjectType({ description: 'Entity for InspectionDrawingType' })
export class InspectionDrawingType {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @ManyToOne(type => Domain)
  @Field({ nullable: true })
  domain?: Domain

  @RelationId((inspectionDrawingType: InspectionDrawingType) => inspectionDrawingType.domain)
  domainId?: string

  @Column({ nullable: false, comment: '검측 도면 타입 이름' })
  @Field({ nullable: true })
  name?: string

  // 검측 부위 정보 (하위 테이블 참조)
  @Field(() => [InspectionPart], { nullable: true })
  @OneToMany(() => InspectionPart, inspectionPart => inspectionPart.inspectionDrawingType)
  inspectionParts?: InspectionPart[]

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((inspectionDrawingType: InspectionDrawingType) => inspectionDrawingType.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((inspectionDrawingType: InspectionDrawingType) => inspectionDrawingType.updater)
  updaterId?: string
}
