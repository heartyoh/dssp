import { EventSubscriber } from 'typeorm'

import { HistoryEntitySubscriber } from '@operato/typeorm-history'

import { ChecklistItemComment } from './checklist-item-comment'
import { ChecklistItemCommentHistory } from './checklist-item-comment-history'

@EventSubscriber()
export class ChecklistItemCommentHistoryEntitySubscriber extends HistoryEntitySubscriber<ChecklistItemComment, ChecklistItemCommentHistory> {
  public get entity() {
    return ChecklistItemComment
  }

  public get historyEntity() {
    return ChecklistItemCommentHistory
  }
}
