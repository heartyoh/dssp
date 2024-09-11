import { EventSubscriber } from 'typeorm'

import { HistoryEntitySubscriber } from '@operato/typeorm-history'

import { BuildingInspection } from './building-inspection'
import { BuildingInspectionHistory } from './building-inspection-history'

@EventSubscriber()
export class BuildingInspectionHistoryEntitySubscriber extends HistoryEntitySubscriber<
  BuildingInspection,
  BuildingInspectionHistory
> {
  public get entity() {
    return BuildingInspection
  }

  public get historyEntity() {
    return BuildingInspectionHistory
  }
}
