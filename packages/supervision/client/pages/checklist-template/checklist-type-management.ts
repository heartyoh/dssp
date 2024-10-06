import '@material/web/icon/icon.js'
import '@operato/context/ox-context-page-toolbar.js'
import '@operato/data-grist'

import gql from 'graphql-tag'
import { css, html } from 'lit'
import { CommonGristStyles, CommonButtonStyles, CommonHeaderStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { customElement, query, state } from 'lit/decorators.js'
import { DataGrist, FetchOption } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import { i18next, localize } from '@operato/i18n'
import { p13n } from '@operato/p13n'

export enum ChecklistTypeMainType {
  BASIC = '10',
  NON_BASIC = '20'
}
export const CHECKLIST_MAIN_TYPE_LIST = {
  [ChecklistTypeMainType.BASIC]: '기본 업무',
  [ChecklistTypeMainType.NON_BASIC]: '기본 외 업무'
}

@customElement('checklist-type-management')
export class ChecklistTypeManagement extends p13n(localize(i18next)(PageView)) {
  static styles = [
    ScrollbarStyles,
    CommonGristStyles,
    CommonHeaderStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }

      ox-grist {
        overflow-y: auto;
        flex: 1;
      }

      .header {
        grid-template-areas: 'filters actions';
      }
    `
  ]

  @state() private gristConfig: any
  @query('ox-grist') private grist!: DataGrist

  get context() {
    return {
      title: '체크리스트 구분 관리',
      search: {
        handler: (search: string) => {
          this.grist.searchText = search
        },
        value: this.grist?.searchText
      },
      filter: {
        handler: () => {
          this.grist.toggleHeadroom()
        }
      },
      actions: [
        {
          title: '저장',
          action: this._updateChecklistType.bind(this),
          ...CommonButtonStyles.submit
        },
        {
          title: '삭제',
          action: this._deleteChecklistType.bind(this),
          ...CommonButtonStyles.delete
        }
      ],
      toolbar: false
    }
  }

  render() {
    return html`
      <ox-grist
        .mode=${'GRID'}
        .config=${this.gristConfig}
        .fetchHandler=${this.fetchHandler.bind(this)}
        .personalConfigProvider=${this.getPagePreferenceProvider('ox-grist')!}
      >
        <div slot="headroom" class="header">
          <div class="filters">
            <ox-filters-form autofocus without-search></ox-filters-form>
          </div>

          <ox-context-page-toolbar class="actions" .context=${this.context}> </ox-context-page-toolbar>
        </div>

        <ox-grist-personalizer slot="setting"></ox-grist-personalizer>
      </ox-grist>
    `
  }

  async pageInitialized(lifecycle: any) {
    this.gristConfig = {
      columns: [
        { type: 'gutter', gutterName: 'sequence' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'select',
          name: 'mainType',
          header: '메인 구분',
          record: {
            editable: true,
            options: [{ display: '', value: '' }].concat(
              Object.keys(CHECKLIST_MAIN_TYPE_LIST).map(key => ({ display: CHECKLIST_MAIN_TYPE_LIST[key], value: key }))
            )
          },
          filter: true,
          sortable: true,
          width: 150
        },
        {
          type: 'string',
          name: 'detailType',
          header: '상세 구분',
          record: {
            editable: true
          },
          filter: 'search',
          sortable: true,
          width: 250
        },
        {
          type: 'resource-object',
          name: 'updater',
          header: '수정자',
          record: {
            editable: false
          },
          width: 120
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: '수정일시',
          record: {
            editable: false
          },
          sortable: true,
          width: 180
        }
      ],
      rows: {
        selectable: {
          multiple: true
        },
        classifier: (record, rowIndex) => {
          return {
            emphasized:
              record.mainType == ChecklistTypeMainType.BASIC
                ? ['var(--grid-record-odd-background-color)', 'var(--grid-record-color)']
                : ['var(--grid-record-background-color)', 'var(--grid-record-color)']
          }
        }
      },
      sorters: [{ name: 'mainType' }, { name: 'updatedAt', desc: true }, { name: 'detailType' }]
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

  private async _updateChecklistType() {
    let patches = this.grist.dirtyRecords
    if (patches && patches.length) {
      patches = patches.map(patch => {
        let patchField: any = patch.id ? { id: patch.id } : {}
        const dirtyFields = patch.__dirtyfields__
        for (let key in dirtyFields) {
          patchField[key] = dirtyFields[key].after
        }
        patchField.cuFlag = patch.__dirty__

        return patchField
      })

      const response = await client.mutate({
        mutation: gql`
          mutation ($patches: [ChecklistTypePatch!]!) {
            updateMultipleChecklistType(patches: $patches) {
              id
            }
          }
        `,
        variables: {
          patches
        }
      })

      if (!response.errors) {
        this.grist.fetch()
        notify({ message: '저장되었습니다.' })
      } else {
        notify({ message: '저장에 실패하였습니다.', level: 'error' })
      }
    }
  }
}
