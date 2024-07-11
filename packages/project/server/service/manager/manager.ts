import { Entity, Index, Column, RelationId, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { Domain } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'

@Entity()
@Index('ix_manager_0', (manager: Manager) => [manager.user])
@ObjectType({ description: '담당자 관리' })
export class Manager {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  readonly id: string

  @Column({ nullable: true, comment: '핸드폰 번호' })
  @Field({ nullable: true })
  phone?: string

  @Column({ nullable: true, comment: '직위' })
  @Field({ nullable: true })
  position?: string

  @OneToOne(type => User)
  @JoinColumn()
  @Field({ nullable: true })
  user?: User

  @RelationId((manager: Manager) => manager.user)
  userId?: string
}
