import '@operato/data-grist'

import { CommonButtonStyles, CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { DataGrist, FetchOption } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { i18next, localize } from '@operato/i18n'
import { notify, openPopup } from '@operato/layout'
import gql from 'graphql-tag'

@customElement('construction-type-management')
export class ConstructionTypeManagement extends PageView {
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

      div.summary {
        display: grid;
        grid-template-columns: 0.7fr 1fr 0.7fr 1fr 0.7fr 1fr 0.7fr 1fr;
        border: solid #d3dbe5;
        border-width: 2px 0;
        margin: 15px 40px;
        align-content: center;

        span.title {
          background-color: #e9edf6;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 35px;
          font-weight: bold;
        }
        span.value {
          padding-left: 10px;
          display: flex;
          align-items: center;
          height: 35px;
        }
      }
    `
  ]

  @property({ type: Object }) gristConfig: any
  @query('ox-grist') private grist!: DataGrist

  get context() {
    return {
      title: '담당자 관리',
      actions: [
        {
          title: '저장',
          action: this._updateTaxInvoice.bind(this),
          ...CommonButtonStyles.save
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
        {
          type: 'string',
          name: 'name',
          header: '이름',
          record: {
            editable: true
          },
          filter: 'search',
          width: 150
        },
        {
          type: 'string',
          name: 'phone',
          header: '휴대폰 번호',
          record: {
            editable: true
          },
          filter: 'search',
          width: 150
        },
        {
          type: 'string',
          name: 'position',
          header: '직위',
          record: {
            editable: true
          },
          filter: 'search',
          width: 150
        }
      ],
      // rows: {
      //   appendable: false
      // },
      sorters: [
        {
          name: 'createdAt'
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
        query ($filters: [Filter!], $pagination: Pagination, $sortings: [Sorting!], $summaryFilters: [Filter!]) {
          ㅡ뭄ㅎㄷㄱㄴ(filters: $filters, pagination: $pagination, sortings: $sortings) {
            items {
              id
              memo
              category
              issueDate
              signatureDate
              supplierBusinessRegistrationNumber
              supplierBusinessName
              supplierRepresentativeName
              totalAmount
              supplyAmount
              taxAmount
              approvalNo
              invoiceType
              remark0
              purpose
              supplierContactEmail
              buyer1stContactEmail
              buyer2ndContactEmail
              updater {
                id
                name
              }
              updatedAt
            }
            total
          }
          taxInvoicesSummary(filters: $summaryFilters) {
            summary
          }
        }
      `,
      variables: {
        filters,
        pagination: { page, limit },
        sortings,
        summaryFilters: filters
      }
    })

    return {
      total: response.data.taxInvoices.total || 0,
      records: response.data.taxInvoices.items || []
    }
  }

  async _updateTaxInvoice() {
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
          mutation ($patches: [TaxInvoicePatch!]!) {
            updateMultipleTaxInvoice(patches: $patches) {
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
        notify({ message: i18next.t('text.info_x_successfully', { x: i18next.t('text.save') }) })
      } else {
        notify({ message: i18next.t('error.fail-save'), level: 'error' })
      }
    }
  }
}
