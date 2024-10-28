import { ChecklistItemComment } from './checklist-item-comment'
import { ChecklistItemCommentHistory } from './checklist-item-comment-history'
import { ChecklistItemCommentHistoryEntitySubscriber } from './event-subscriber'
import { ChecklistItemCommentQuery } from './checklist-item-comment-query'
import { ChecklistItemCommentMutation } from './checklist-item-comment-mutation'

export const entities = [ChecklistItemComment, ChecklistItemCommentHistory]
export const resolvers = [ChecklistItemCommentQuery, ChecklistItemCommentMutation]
export const subscribers = [ChecklistItemCommentHistoryEntitySubscriber]
