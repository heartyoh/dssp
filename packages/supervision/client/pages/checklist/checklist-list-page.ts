import '@material/web/icon/icon.js'
import '@material/web/button/elevated-button.js'
import '@operato/data-grist/ox-grist.js'
import '@operato/data-grist/ox-filters-form.js'
import '@operato/data-grist/ox-record-creator.js'

import { CommonButtonStyles, CommonHeaderStyles, CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageView, store } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { ColumnConfig, DataGrist, FetchOption } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { i18next, localize } from '@operato/i18n'
import { notify, openPopup } from '@operato/layout'
import { OxPopup, OxPrompt } from '@operato/popup'
import { isMobileDevice } from '@operato/utils'

import { connect } from 'pwa-helpers/connect-mixin'
import gql from 'graphql-tag'

import { ChecklistImporter } from './checklist-importer'

@customElement('checklist-list-page')
export class ChecklistListPage extends connect(store)(localize(i18next)(ScopedElementsMixin(PageView))) {

  static styles = [
    ScrollbarStyles,
    CommonGristStyles,
    CommonHeaderStyles,
    css`
      :host {
        display: flex;

        width: 100%;

        --grid-record-emphasized-background-color: #8B0000;
        --grid-record-emphasized-color: #FF6B6B;
      }

      ox-grist {
        overflow-y: auto;
        flex: 1;
      }

      ox-filters-form {
        flex: 1;
      }
    `
  ]

  static get scopedElements() {
    return {
      'checklist-importer': ChecklistImporter
    }
  }

  @property({ type: Object }) gristConfig: any
  @property({ type: String }) mode: 'CARD' | 'GRID' | 'LIST' = isMobileDevice() ? 'CARD' : 'GRID'

  @query('ox-grist') private grist!: DataGrist

  get context() {
    return {
      title: i18next.t('title.checklist list'),
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
      help: 'supervision/checklist',
      actions: [
        {
          title: i18next.t('button.save'),
          action: this._updateChecklist.bind(this),
          ...CommonButtonStyles.save
        },
        {
          title: i18next.t('button.delete'),
          action: this._deleteChecklist.bind(this),
          ...CommonButtonStyles.delete
        }
      ],
      exportable: {
        name: i18next.t('title.checklist list'),
        data: this.exportHandler.bind(this)
      },
      importable: {
        handler: this.importHandler.bind(this)
      }
    }
  }

  render() {
    const mode = this.mode || (isMobileDevice() ? 'CARD' : 'GRID')

    return html`
      <ox-grist
        .mode=${mode}
        .config=${this.gristConfig}
        .fetchHandler=${this.fetchHandler.bind(this)}
      >
        <div slot="headroom" class="header">
          <div class="filters">
            <ox-filters-form autofocus without-search></ox-filters-form>

            <div id="modes">
              <md-icon @click=${() => (this.mode = 'GRID')} ?active=${mode == 'GRID'}>grid_on</md-icon>
              <md-icon @click=${() => (this.mode = 'LIST')} ?active=${mode == 'LIST'}>format_list_bulleted</md-icon>
              <md-icon @click=${() => (this.mode = 'CARD')} ?active=${mode == 'CARD'}>apps</md-icon>
            </div>

            <ox-record-creator id="add" .callback=${this.creationCallback.bind(this)}>
              <button>
                <md-icon>add</md-icon>
              </button>
            </ox-record-creator>

          </div>
        </div>
      </ox-grist>
    `
  }

  async pageInitialized(lifecycle: any) {
    this.gristConfig = {
      list: {
        fields: ['name', 'description'],
        details: ['active', 'updatedAt']
      },
      columns: [
        { type: 'gutter', gutterName: 'sequence' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'string',
          name: 'name',
          header: i18next.t('field.name'),
          record: {
            editable: true
          },
          filter: 'search',
          sortable: true,
          width: 150
        },
        {
          type: 'string',
          name: 'description',
          header: i18next.t('field.description'),
          record: {
            editable: true
          },
          filter: 'search',
          width: 200
        },
        {
          type: 'checkbox',
          name: 'active',
          label: true,
          header: i18next.t('field.active'),
          record: {
            editable: true
          },
          filter: true,
          sortable: true,
          width: 60
        },
        {
          type: 'resource-object',
          name: 'updater',
          header: i18next.t('field.updater'),
          record: {
            editable: false
          },
          sortable: true,
          width: 120
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: i18next.t('field.updated_at'),
          record: {
            editable: false
          },
          sortable: true,
          width: 180
        }
      ],
      rows: {
        appendable: false,
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
  }

  async pageUpdated(changes: any, lifecycle: any) {
    if (this.active) {
      // do something here when this page just became as active
    }
  }

  async fetchHandler({ page = 1, limit = 100, sortings = [], filters = [] }: FetchOption) {
    const response = await client.query({
      query: gql`
        query ($filters: [Filter!], $pagination: Pagination, $sortings: [Sorting!]) {
          responses: checklists(filters: $filters, pagination: $pagination, sortings: $sortings) {
            items {
              id
              name
              description
              active
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

  async _deleteChecklist() {
    if (
      await OxPrompt.open({
        title: i18next.t('text.are_you_sure'),
        text: i18next.t('text.sure_to_x', { x: i18next.t('text.delete') }),
        confirmButton: { text: i18next.t('button.confirm') },
        cancelButton: { text: i18next.t('button.cancel') }
      })
    ) {
      const ids = this.grist.selected.map(record => record.id)
      if (ids && ids.length > 0) {
        const response = await client.mutate({
          mutation: gql`
            mutation ($ids: [String!]!) {
              deleteChecklists(ids: $ids)
            }
          `,
          variables: {
            ids
          }
        })

        if (!response.errors) {
          this.grist.fetch()
          notify({
            message: i18next.t('text.info_x_successfully', { x: i18next.t('text.delete') })
          })
        }
      }
    }
  }

  async _updateChecklist() {
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
          mutation ($patches: [ChecklistPatch!]!) {
            updateMultipleChecklist(patches: $patches) {
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
      }
    }
  }

  async creationCallback(checklist) {
    try {
      const response = await client.query({
        query: gql`
          mutation ($checklist: NewChecklist!) {
            createChecklist(checklist: $checklist) {
              id
            }
          }
        `,
        variables: {
          checklist
        },
        context: {
          hasUpload: true
        }
      })

      if (!response.errors) {
        this.grist.fetch()
        document.dispatchEvent(
          new CustomEvent('notify', {
            detail: {
              message: i18next.t('text.data_created_successfully')
            }
          })
        )
      }

      return true
    } catch (ex) {
      console.error(ex)
      document.dispatchEvent(
        new CustomEvent('notify', {
          detail: {
            type: 'error',
            message: i18next.t('text.error')
          }
        })
      )
      return false
    }
  }

  async exportHandler() {
    const exportTargets = this.grist.selected.length ? this.grist.selected : this.grist.dirtyData.records
    const targetFieldSet = new Set([
      'id',
      'name',
      'description',
      'active'
    ])

    return exportTargets.map(checklist => {
      let tempObj = {}
      for (const field of targetFieldSet) {
        tempObj[field] = checklist[field]
      }

      return tempObj
    })
  }

  async importHandler(records) {
    const popup = openPopup(
      html`
        <checklist-importer
          .checklists=${records}
          @imported=${() => {
            history.back()
            this.grist.fetch()
          }}
        ></checklist-importer>
      `,
      {
        backdrop: true,
        size: 'large',
        title: i18next.t('title.import checklist')
      }
    )
    
    popup.onclosed = () => {
      this.grist.fetch()
    }
  }
}

