import '@operato/data-grist'
import '@operato/context/ox-context-page-toolbar.js'

import { CommonGristStyles, CommonButtonStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { DataGrist } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { notify, openPopup } from '@operato/layout'
import gql from 'graphql-tag'
import './inspection-part-popup'

@customElement('inspection-drawing-type-management')
export class InspectionDrawingTypeManagement extends PageView {
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

  @property({ type: Object }) gristConfig: any
  @query('ox-grist') private grist!: DataGrist

  get context() {
    return {
      title: '도면 타입 관리',
      actions: [
        {
          title: '저장',
          action: this._updateInspectionDrawingTypes.bind(this),
          ...CommonButtonStyles.save
        },
        {
          title: '삭제',
          action: this._deleteInspectionDrawingTypes.bind(this),
          ...CommonButtonStyles.delete
        }
      ]
    }
  }

  render() {
    return html`
      <ox-grist .mode=${'GRID'} .config=${this.gristConfig} .fetchHandler=${this.fetchHandler.bind(this)}> </ox-grist>
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
                  <inspection-part-popup
                    .inspectionDrawingType=${record}
                    @requestRefresh="${() => this.grist.fetch()}"
                  ></inspection-part-popup>
                `,
                {
                  backdrop: true,
                  size: 'large',
                  title: '검측 부위 관리'
                }
              )
            }
          }
        },
        {
          type: 'string',
          name: 'name',
          header: '검측 도면 타입',
          record: {
            editable: true
          },
          width: 150
        },
        {
          type: 'datetime',
          name: 'createdAt',
          header: '생성 시간',
          width: 200
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: '수정 시간',
          width: 200
        }
      ],
      rows: {
        selectable: {
          multiple: true
        }
      },
      pagination: { infinite: true }
    }
  }

  async fetchHandler() {
    const response = await client.query({
      query: gql`
        query InspectionDrawingTypes {
          inspectionDrawingTypes {
            items {
              id
              name
              createdAt
              updatedAt
            }
            total
          }
        }
      `
    })

    if (response.errors) return {}

    return {
      total: response.data.inspectionDrawingTypes.total || 0,
      records: response.data.inspectionDrawingTypes.items || []
    }
  }

  async _updateInspectionDrawingTypes() {
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
          mutation UpdateMultipleInspectionDrawingType($patches: [InspectionDrawingTypePatch!]!) {
            updateMultipleInspectionDrawingType(patches: $patches) {
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

  async _deleteInspectionDrawingTypes() {
    if (confirm('삭제하시겠습니까?')) {
      const ids = this.grist.selected.map(record => record.id)
      if (ids && ids.length > 0) {
        const response = await client.mutate({
          mutation: gql`
            mutation DeleteInspectionDrawingTypes($ids: [String!]!) {
              deleteInspectionDrawingTypes(ids: $ids)
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
}
