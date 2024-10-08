import '@material/web/icon/icon.js'
import '@operato/data-grist'

import { CommonButtonStyles, CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageView, store } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import {
  ColumnConfig,
  DataGrist,
  FetchOption,
  SortersControl
} from '@operato/data-grist'
import { client } from '@operato/graphql'
import { i18next, localize } from '@operato/i18n'
import { notify, openPopup } from '@operato/layout'
import { OxPopup, OxPrompt } from '@operato/popup'
import { isMobileDevice } from '@operato/utils'

import { connect } from 'pwa-helpers/connect-mixin'
import gql from 'graphql-tag'

import { ResourceImporter } from './resource-importer'

@customElement('resource-list-page')
export class ResourceListPage extends connect(store)(localize(i18next)(ScopedElementsMixin(PageView))) {

  static styles = [
    ScrollbarStyles,
    CommonGristStyles,
    css`
      :host {
        display: flex;

        width: 100%;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }
    `
  ]

  static get scopedElements() {
    return {
      'resource-importer': ResourceImporter
    }
  }

  @state() private gristConfig: any
  @state() private mode: 'CARD' | 'GRID' | 'LIST' = isMobileDevice() ? 'CARD' : 'GRID'

  @query('ox-grist') private grist!: DataGrist
  @query('#sorter-control') private sortersControl!: OxPopup

  get context() {
    return {
      title: i18next.t('title.resource list'),
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
      help: 'project/resource',
      actions: [
        {
          title: i18next.t('button.save'),
          action: this.updateResource.bind(this),
          ...CommonButtonStyles.save
        },
        {
          title: i18next.t('button.delete'),
          action: this.deleteResource.bind(this),
          ...CommonButtonStyles.delete
        }
      ],
      exportable: {
        name: i18next.t('title.resource list'),
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
        <div slot="headroom">
          <div id="filters">
            <ox-filters-form autofocus></ox-filters-form>
          </div>

          <div id="sorters">
            Sort
            <md-icon
              @click=${e => {
                const target = e.currentTarget
                this.sortersControl.open({
                  right: 0,
                  top: target.offsetTop + target.offsetHeight
                })
              }}
              >expand_more</md-icon
            >
            <ox-popup id="sorter-control">
              <ox-sorters-control> </ox-sorters-control>
            </ox-popup>
          </div>

          <div id="modes">
            <md-icon @click=${() => (this.mode = 'GRID')} ?active=${mode == 'GRID'}>grid_on</md-icon>
            <md-icon @click=${() => (this.mode = 'LIST')} ?active=${mode == 'LIST'}>format_list_bulleted</md-icon>
            <md-icon @click=${() => (this.mode = 'CARD')} ?active=${mode == 'CARD'}>apps</md-icon>
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
          responses: resources(filters: $filters, pagination: $pagination, sortings: $sortings) {
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

  private async deleteResource() {
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
              deleteResources(ids: $ids)
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

  private async updateResource() {
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
          mutation ($patches: [ResourcePatch!]!) {
            updateMultipleResource(patches: $patches) {
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

  private async exportHandler() {
    const exportTargets = this.grist.selected.length ? this.grist.selected : this.grist.dirtyData.records
    const targetFieldSet = new Set([
      'id',
      'name',
      'description',
      'active'
    ])

    return exportTargets.map(resource => {
      let tempObj = {}
      for (const field of targetFieldSet) {
        tempObj[field] = resource[field]
      }

      return tempObj
    })
  }

  private async importHandler(records) {
    const popup = openPopup(
      html`
        <resource-importer
          .resources=${records}
          @imported=${() => {
            history.back()
            this.grist.fetch()
          }}
        ></resource-importer>
      `,
      {
        backdrop: true,
        size: 'large',
        title: i18next.t('title.import resource')
      }
    )
    
    popup.onclosed = () => {
      this.grist.fetch()
    }
  }
}

