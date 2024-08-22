import '@material/web/icon/icon.js'
import '@operato/data-grist'
import './checklist-template-item'

import { CommonGristStyles, CommonButtonStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { DataGrist, FetchOption } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { notify, openPopup } from '@operato/layout'

import gql from 'graphql-tag'

@customElement('checklist-template-list')
export class ChecklistTemplateListPage extends ScopedElementsMixin(PageView) {
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

      md-elevated-button {
        margin: 0px 3px;

        --md-elevated-button-container-height: 35px;
        --md-elevated-button-label-text-size: 16px;
        --md-elevated-button-container-color: #0595e5;

        --md-elevated-button-label-text-color: #fff;
        --md-elevated-button-hover-label-text-color: #fff;
        --md-elevated-button-pressed-label-text-color: #fff;
        --md-elevated-button-focus-label-text-color: #fff;
        --md-elevated-button-icon-color: #fff;
        --md-elevated-button-hover-icon-color: #fff;
        --md-elevated-button-pressed-icon-color: #fff;
        --md-elevated-button-focus-icon-color: #fff;

        &[red] {
          --md-elevated-button-container-color: #e15757;
        }
      }

      div[button-container] {
        padding: 0 5px 10px 0;
        text-align: right;
      }
    `
  ]

  @state() private gristConfig: any
  @state() private checklistDetailTypes
  @query('ox-grist') private grist!: DataGrist

  get context() {
    return {
      title: '체크리스트 템플릿 리스트',
      search: {
        handler: (search: string) => {
          this.grist.searchText = search
        },
        value: this.grist.searchText
      },
      filter: {
        handler: () => {
          this.grist.toggleHeadroom()
        }
      },
      actions: [
        {
          title: '저장',
          action: this._updateChecklistTemplate.bind(this),
          ...CommonButtonStyles.submit
        },
        {
          title: '삭제',
          action: this.deleteChecklistTemplate.bind(this),
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

  async pageInitialized(lifecycle: any) {
    this.gristConfig = {
      columns: [
        { type: 'gutter', gutterName: 'sequence' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'gutter',
          gutterName: 'button',
          fixed: true,
          icon: 'reorder',
          handlers: {
            click: (columns, data, column, record, rowIndex) => {
              if (!record.id) return
              openPopup(
                html`
                  <checklist-template-item
                    .checklistTemplate=${record}
                    .checklistDetailTypes=${this.checklistDetailTypes}
                    @requestRefresh="${() => this.grist.fetch()}"
                  ></checklist-template-item>
                `,
                {
                  backdrop: true,
                  size: 'large',
                  title: '체크 리스트 아이템 템플릿'
                }
              )
            }
          }
        },
        {
          type: 'string',
          name: 'name',
          header: '이름',
          record: {
            editable: true
          },
          filter: 'search',
          sortable: true,
          width: 200
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
          width: 180
        }
      ],
      rows: {
        selectable: {
          multiple: true
        }
      },
      sorters: [
        {
          name: 'name'
        }
      ]
    }

    this.getchecklistTypes()
  }

  async getchecklistTypes() {
    const response = await client.query({
      query: gql`
        query ChecklistTypes {
          checklistTypes {
            items {
              id
              mainType
              detailType
            }
          }
        }
      `
    })

    this.checklistDetailTypes = response.data.checklistTypes?.items?.map(v => {
      return {
        display: v.detailType,
        value: v.id,
        mainType: v.mainType
      }
    })
  }

  async fetchHandler({ page = 1, limit = 100, sortings = [], filters = [] }: FetchOption) {
    const response = await client.query({
      query: gql`
        query ($filters: [Filter!], $pagination: Pagination, $sortings: [Sorting!]) {
          responses: checklistTemplates(filters: $filters, pagination: $pagination, sortings: $sortings) {
            items {
              id
              name
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

  private async deleteChecklistTemplate() {
    if (confirm('삭제하시겠습니까?')) {
      const ids = this.grist.selected.map(record => record.id)
      if (ids && ids.length > 0) {
        const response = await client.mutate({
          mutation: gql`
            mutation ($ids: [String!]!) {
              deleteChecklistTemplates(ids: $ids)
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

  private async _updateChecklistTemplate() {
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
          mutation ($patches: [ChecklistTemplatePatch!]!) {
            updateMultipleChecklistTemplate(patches: $patches) {
              name
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
