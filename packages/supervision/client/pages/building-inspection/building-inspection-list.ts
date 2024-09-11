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
          type: 'select',
          name: 'mainType',
          header: '검측 위치',
          filter: 'search',
          sortable: true,
          width: 150
        },
        {
          type: 'string',
          name: 'detailType',
          header: '공종',
          filter: 'search',
          sortable: true,
          width: 250
        },
        {
          type: 'string',
          name: 'updater',
          header: '내용',
          width: 120
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: '검측 요청일',
          sortable: true,
          width: 180
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: '검측 결과',
          sortable: true,
          width: 180
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: '검측 결과 데이터',
          sortable: true,
          width: 180
        }
      ],
      rows: {
        selectable: {
          multiple: true
        }
      },
      sorters: [{ name: 'updatedAt' }, { name: 'mainType' }, { name: 'detailType' }]
    }
  }

  async fetchHandler({ page = 1, limit = 100, sortings = [], filters = [] }: FetchOption) {
    const response = await client.query({
      query: gql`
        query ($filters: [Filter!], $pagination: Pagination, $sortings: [Sorting!]) {
          responses: checklistTypes(filters: $filters, pagination: $pagination, sortings: $sortings) {
            items {
              id
              mainType
              detailType
              updater {
                id
                name
              }
              updatedAt
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

    return {
      total: response.data.responses.total || 0,
      records: response.data.responses.items || []
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
      html` <inspection-create-popup .projectId=${this.projectId} @requestRefresh="${() => {}}"></inspection-create-popup> `,
      {
        backdrop: true,
        size: 'large',
        title: '검측 요청서 등록'
      }
    )
  }
}
