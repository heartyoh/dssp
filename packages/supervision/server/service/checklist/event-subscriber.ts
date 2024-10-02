import { EventSubscriber } from 'typeorm'

import { HistoryEntitySubscriber } from '@operato/typeorm-history'

import { Checklist } from './checklist'
import { ChecklistHistory } from './checklist-history'

@EventSubscriber()
export class ChecklistHistoryEntitySubscriber extends HistoryEntitySubscriber<Checklist, ChecklistHistory> {
  public get entity() {
    return Checklist
  }

  public get historyEntity() {
    return ChecklistHistory
  }
}
