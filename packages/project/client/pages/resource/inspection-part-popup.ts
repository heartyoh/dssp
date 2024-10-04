import '@material/web/icon/icon.js'
import '@operato/data-grist/ox-grist.js'

import gql from 'graphql-tag'
import { css, html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

import { DataGrist } from '@operato/data-grist/ox-grist.js'
import { client } from '@operato/graphql'
import { ButtonContainerStyles } from '@operato/styles'
import { FetchOption } from '@operato/data-grist'
import { notify } from '@operato/layout'

@customElement('inspection-part-popup')
class InspectionPartPopup extends LitElement {
  static styles = [
    ButtonContainerStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;

        background-color: var(--md-sys-color-surface);
      }

      ox-grist {
        flex: 1;
      }
    `
  ]

  @property({ type: Object }) inspectionDrawingType: any
  @property({ type: Object }) gristConfig: any

  @query('ox-grist') grist!: DataGrist

  render() {
    return html`
      <ox-grist .mode=${'GRID'} .config=${this.gristConfig} .fetchHandler=${this.fetchHandler.bind(this)}></ox-grist>
      <div class="button-container">
        <button danger @click=${this._deleteInspectionPart.bind(this)}><md-icon>delete</md-icon>삭제</button>
        <button @click=${this._updateInspectionPart.bind(this)}><md-icon>save</md-icon>저장</button>
      </div>
    `
  }

  async firstUpdated() {
    this.gristConfig = {
      columns: [
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'gutter',
          gutterName: 'button',
          fixed: true,
          icon: 'add',
          handlers: {
            click: 'record-copy'
          }
        },
        { type: 'gutter', gutterName: 'sequence' },
        {
          type: 'gutter',
          gutterName: 'button',
          icon: 'arrow_upward',
          handlers: {
            click: 'move-up'
          }
        },
        {
          type: 'gutter',
          gutterName: 'button',
          icon: 'arrow_downward',
          handlers: {
            click: 'move-down'
          }
        },
        {
          type: 'number',
          name: 'sequence',
          hidden: true
        },
        {
          type: 'string',
          name: 'id',
          hidden: true
        },
        {
          type: 'string',
          name: 'name',
          header: '검측 부위',
          record: {
            editable: true
          },
          width: 300
        }
      ],
      rows: {
        selectable: {
          multiple: true
        }
      },
      pagination: {
        infinite: true
      },
      sorters: [{ name: 'sequence' }]
    }
  }

  async fetchHandler({ page, limit, sorters = [] }: FetchOption) {
    const response = await client.query({
      query: gql`
        query ($filters: [Filter!], $pagination: Pagination, $sortings: [Sorting!]) {
          inspectionParts(filters: $filters, pagination: $pagination, sortings: $sortings) {
            items {
              id
              sequence
              name
            }
          }
        }
      `,
      variables: {
        filters: {
          name: 'inspectionDrawingTypeId',
          value: this.inspectionDrawingType.id,
          operator: 'eq'
        },
        sortings: [{ name: 'sequence' }]
      }
    })

    return {
      total: response.data.inspectionParts.total || 0,
      records: response.data.inspectionParts.items || []
    }
  }

  private async _deleteInspectionPart() {
    if (confirm('삭제하시겠습니까?')) {
      const ids = this.grist.selected.map(record => record.id)
      if (ids && ids.length > 0) {
        const response = await client.mutate({
          mutation: gql`
            mutation ($ids: [String!]!) {
              deleteInspectionParts(ids: $ids)
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

  async _updateInspectionPart() {
    let patches = this.grist.dirtyData.records
    if (patches) {
      patches = patches.map(patch => {
        const { __origin__: { __typename, ...patchField } = {}, __dirtyfields__ } = patch

        for (let key in __dirtyfields__) {
          patchField[key] = __dirtyfields__[key].after
        }

        return patchField
      })

      const response = await client.mutate({
        mutation: gql`
          mutation UpdateMultipleInspectionPart($inspectionDrawingTypeId: String!, $patches: [InspectionPartPatch!]!) {
            updateMultipleInspectionPart(inspectionDrawingTypeId: $inspectionDrawingTypeId, patches: $patches) {
              id
            }
          }
        `,
        variables: {
          inspectionDrawingTypeId: this.inspectionDrawingType.id,
          patches
        }
      })

      if (!response.errors) {
        this.grist.fetch()
        notify({ message: '저장되었습니다.' })
        this.requestRefresh()
      } else {
        notify({ message: '저장에 실패하였습니다.', level: 'error' })
      }
    }
  }

  requestRefresh() {
    this.dispatchEvent(new CustomEvent('requestRefresh'))
  }
}