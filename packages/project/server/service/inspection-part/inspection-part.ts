import { CreateDateColumn, UpdateDateColumn, Entity, Index, Column, RelationId, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ObjectType, Field, ID, Int } from 'type-graphql'
import { User } from '@things-factory/auth-base'
import { InspectionDrawingType } from '../inspection-drawing-type/inspection-drawing-type'

@Entity()
@Index('ix_inspection_part_0', (inspectionPart: InspectionPart) => [inspectionPart.sequence])
@ObjectType({ description: 'Entity for InspectionPart' })
export class InspectionPart {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: false, comment: '검측 부위' })
  @Field({ nullable: true })
  name?: string

  @Column({ nullable: true, comment: '시퀀스' })
  @Field(type => Int, { nullable: true })
  sequence?: number

  // 검측 도면 정보 (상위 테이블 참조)
  @ManyToOne(type => InspectionDrawingType)
  @Field(type => InspectionDrawingType, { nullable: true })
  inspectionDrawingType?: InspectionDrawingType

  @RelationId((inspectionPart: InspectionPart) => inspectionPart.inspectionDrawingType)
  inspectionDrawingTypeId?: string

  @CreateDateColumn()
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn()
  @Field({ nullable: true })
  updatedAt?: Date

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  creator?: User

  @RelationId((inspectionPart: InspectionPart) => inspectionPart.creator)
  creatorId?: string

  @ManyToOne(type => User, { nullable: true })
  @Field(type => User, { nullable: true })
  updater?: User

  @RelationId((inspectionPart: InspectionPart) => inspectionPart.updater)
  updaterId?: string
}
