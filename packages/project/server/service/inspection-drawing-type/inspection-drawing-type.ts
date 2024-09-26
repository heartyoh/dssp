import { CreateDateColumn, UpdateDateColumn, Entity, Index, Column, RelationId, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { User } from '@things-factory/auth-base'
import { Domain } from '@things-factory/shell'

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
