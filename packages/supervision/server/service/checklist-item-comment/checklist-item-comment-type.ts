import { ObjectType, Field, InputType, Int, ID } from 'type-graphql'
import { ChecklistItemComment } from './checklist-item-comment'

@InputType()
export class NewChecklistItemComment {
  @Field({ nullable: true })
  comment?: string

  @Field({ nullable: true })
  checklistItemId?: string
}

@InputType()
export class ChecklistItemCommentPatch {
  @Field(type => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  comment?: string

  @Field({ nullable: true })
  checklistItemId?: string
}

@ObjectType()
export class ChecklistItemCommentList {
  @Field(type => [ChecklistItemComment])
  items: ChecklistItemComment[]

  @Field(type => Int)
  total: number
}
