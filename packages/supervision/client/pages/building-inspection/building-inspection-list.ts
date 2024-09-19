import '@material/web/icon/icon.js'
import '@operato/data-grist'

import { CommonGristStyles, CommonButtonStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { customElement, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { DataGrist, FetchOption } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'
import { openPopup } from '@operato/layout'
import './inspection-create-popup'

export enum ChecklistTypeMainType {
  BASIC = '10',
  NON_BASIC = '20'
}
export const CHECKLIST_MAIN_TYPE_LIST = {
  [ChecklistTypeMainType.BASIC]: '기본 업무',
  [ChecklistTypeMainType.NON_BASIC]: '기본 외 업무'
}

export enum BuildingInspectionStatus {
  REQUEST = 'REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}
export const BUILDING_INSPECTION_STATUS = {
  [BuildingInspectionStatus.REQUEST]: '요청',
  [BuildingInspectionStatus.PASS]: '합격',
  [BuildingInspectionStatus.FAIL]: '불합격'
}

@customElement('building-inspection-list')
export class BuildingInspectionList extends ScopedElementsMixin(PageView) {
  static styles = [
    ScrollbarStyles,
    CommonGristStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;

        width: 100%;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }
    `
  ]

  @state() private gristConfig: any
  @state() projectId: string = ''
  @query('ox-grist') private grist!: DataGrist

  get context() {
    return {
      title: '검측 관리',
      actions: [
        {
          title: '검측 등록',
          action: this._openCreateInspection.bind(this),
          ...CommonButtonStyles.submit
        },
        {
          title: '삭제',
          action: this._deleteChecklistType.bind(this),
          ...CommonButtonStyles.delete
        }
      ]
    }
  }

  render() {
    return html`
      <ox-grist .mode=${'GRID'} .config=${this.gristConfig} .fetchHandler=${this.fetchHandler.bind(this)}>
        <div slot="headroom">
          <div id="filters">
            <ox-filters-form autofocus></ox-filters-form>
          </div>
        </div>
      </ox-grist>
    `
  }

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      this.projectId = lifecycle.resourceId || ''
    }
  }

  async pageInitialized(lifecycle: any) {
    this.gristConfig = {
      columns: [
        { type: 'gutter', gutterName: 'sequence' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'string',
          name: 'location',
          header: '위치 및 부위',
          width: 150
        },
        {
          type: 'string',
          name: 'constructionType',
          header: '공종',
          width: 120
        },
        {
          type: 'string',
          name: 'constructionDetailType',
          header: '세부 공종',
          width: 200
        },
        {
          type: 'string',
          name: 'requestDate',
          header: '검측 요청일',
          record: {
            renderer: value =>
              value
                ? new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Seoul',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).format(new Date(value))
                : ''
          },
          width: 120
        },
        {
          type: 'string',
          name: 'status',
          header: '검측 결과',
          record: {
            renderer: value => BUILDING_INSPECTION_STATUS[value]
          },
          width: 120
        },
        {
          type: 'datetime',
          name: '',
          header: '검측 결과 데이터',
          width: 180
        }
      ],
      rows: {
        selectable: {
          multiple: true
        }
      },
      sorters: [{ name: 'requestDate' }]
    }
  }

  async fetchHandler({ page = 1, limit = 100, sortings = [], filters = [] }: FetchOption) {
    const response = await client.query({
      query: gql`
        query BuildingInspections($filters: [Filter!], $pagination: Pagination) {
          buildingInspections(filters: $filters, pagination: $pagination) {
            items {
              id
              status
              requestDate
              checklist {
                id
                name
                constructionType
                constructionDetailType
                location
                location
              }
            }
            total
          }
        }
      `,
      variables: {
        filters,
        pagination: { page, limit },
        sortings
      }
    })

    let items = response.data.buildingInspections?.items || []
    items = items.map(item => ({
      location: item.checklist.location,
      constructionType: item.checklist.constructionType,
      constructionDetailType: item.checklist.constructionDetailType,
      requestDate: item.requestDate,
      status: item.status
    }))

    return {
      total: response.data.buildingInspections.total || 0,
      records: items
    }
  }

  private async _deleteChecklistType() {
    if (confirm('삭제하시겠습니까?')) {
      const ids = this.grist.selected.map(record => record.id)
      if (ids && ids.length > 0) {
        const response = await client.mutate({
          mutation: gql`
            mutation ($ids: [String!]!) {
              deleteChecklistTypes(ids: $ids)
            }
          `,
          variables: {
            ids
          }
        })

        if (!response.errors) {
          this.grist.fetch()
          notify({ message: '삭제되었습니다.' })
        }
      }
    }
  }

  private _openCreateInspection() {
    openPopup(
      html`
        <inspection-create-popup
          .projectId=${this.projectId}
          @requestRefresh="${() => this.grist.fetch()}"
        ></inspection-create-popup>
      `,
      {
        backdrop: true,
        size: 'large',
        title: '검측 요청서 등록'
      }
    )
  }
}
