import '@material/web/icon/icon.js'
import '@operato/data-grist/ox-grist.js'

import gql from 'graphql-tag'
import { css, html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { DataGrist } from '@operato/data-grist/ox-grist.js'
import { client } from '@operato/graphql'
import { i18next } from '@operato/i18n'
import { ButtonContainerStyles } from '@operato/styles'
import { FetchOption } from '@operato/data-grist'

@customElement('checklist-type-detail')
class ChecklistTypeDetail extends LitElement {
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

  @property({ type: Object }) checklistType: any
  @property({ type: Object }) gristConfig: any
  @query('ox-grist') grist!: DataGrist

  render() {
    return html`
      <ox-grist .mode=${'GRID'} .config=${this.gristConfig} .fetchHandler=${this.fetchHandler.bind(this)}></ox-grist>
      <div class="button-container">
        <button danger @click=${this._deleteSteps.bind(this)}><md-icon>delete</md-icon>${i18next.t('button.delete')}</button>
        <button @click=${this._updateSteps.bind(this)}><md-icon>save</md-icon>${i18next.t('button.save')}</button>
      </div>
    `
  }

  async firstUpdated() {
    this.gristConfig = {
      columns: [
        { type: 'gutter', gutterName: 'row-selector', multiple: true, fixed: true },
        {
          type: 'gutter',
          gutterName: 'button',
          fixed: true,
          icon: 'add',
          handlers: {
            click: 'record-copy'
          }
        },
        { type: 'gutter', gutterName: 'sequence', fixed: true },
        {
          type: 'gutter',
          gutterName: 'button',
          fixed: true,
          icon: 'arrow_upward',
          handlers: {
            click: 'move-up'
          }
        },
        {
          type: 'gutter',
          gutterName: 'button',
          fixed: true,
          icon: 'arrow_downward',
          handlers: {
            click: 'move-down'
          }
        },
        {
          type: 'string',
          name: 'id',
          hidden: true
        },
        {
          type: 'string',
          name: 'name',
          header: '구분 상세',
          record: {
            editable: true
          },
          width: 140
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
      sorters: [
        {
          name: 'sequence'
        }
      ]
    }
  }

  async fetchHandler({ page, limit, sorters = [] }: FetchOption) {
    const response = await client.query({
      query: gql`
        query ($filters: [Filter!], $pagination: Pagination, $sortings: [Sorting!]) {
          responses: checklistTypeDetails(filters: $filters, pagination: $pagination, sortings: $sortings) {
            items {
              id
              sequence
              name
            }
            total
          }
        }
      `,
      variables: {
        filters: {
          name: 'checklist_type_id',
          value: this.checklistType.id,
          operator: 'eq'
        },
        sortings: { name: 'sequence' }
      }
    })

    return {
      total: response.data.responses.total || 0,
      records: response.data.responses.items || []
    }
  }

  async _updateSteps() {
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
          mutation ($checklistTypeId: String!, $patches: [ChecklistTypeDetailPatch!]!) {
            updateMultipleChecklistTypeDetail(checklistTypeId: $checklistTypeId, patches: $patches) {
              name
            }
          }
        `,
        variables: {
          checklistTypeId: this.checklistType.id,
          patches
        }
      })

      if (!response.errors) {
        this.grist.fetch()
        this.requestRefresh()
      }
    }
  }

  async _deleteSteps() {
    this.grist.deleteSelectedRecords(true)
  }

  requestRefresh() {
    this.dispatchEvent(new CustomEvent('requestRefresh'))
  }
}
