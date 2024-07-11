import '@operato/data-grist'
import '@operato/context/ox-context-page-toolbar.js'

import { CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { DataGrist } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
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
    `
  ]

  @property({ type: Object }) gristConfig: any
  @query('ox-grist') private grist!: DataGrist

  get context() {
    return {
      title: '공종 관리',
      actions: [
        {
          title: '저장',
          action: this._updateConstructionTypes.bind(this),
          icon: 'save'
        },
        {
          title: '삭제',
          action: this._deleteConstructionTypes.bind(this),
          icon: 'delete'
        }
      ]
    }
  }

  render() {
    return html`
      <ox-grist .mode=${'GRID'} .config=${this.gristConfig} .fetchHandler=${this.fetchHandler.bind(this)}>
        <div slot="headroom" class="header">
          <ox-context-page-toolbar class="actions" .context=${this.context}></ox-context-page-toolbar>
        </div>
      </ox-grist>
      <div>
        <button @click=${this._updateConstructionTypes.bind(this)}>저장</button>
        <button @click=${this._deleteConstructionTypes.bind(this)}>삭제</button>
      </div>
    `
  }

  async pageInitialized(lifecycle: any) {
    this.gristConfig = {
      columns: [
        { type: 'gutter', gutterName: 'sequence' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'string',
          name: 'name',
          header: '이름',
          record: {
            editable: true
          },
          width: 150
        },
        {
          type: 'string',
          name: 'description',
          header: '설명',
          record: {
            editable: true
          },
          width: 200
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
      pagination: { infinite: true }
    }
  }

  async fetchHandler() {
    const response = await client.query({
      query: gql`
        query ConstructionTypes {
          constructionTypes {
            items {
              id
              name
              description
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
      total: response.data.constructionTypes.total || 0,
      records: response.data.constructionTypes.items || []
    }
  }

  async _updateConstructionTypes() {
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
          mutation UpdateMultipleConstructionType($patches: [ConstructionTypePatch!]!) {
            updateMultipleConstructionType(patches: $patches) {
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

  async _deleteConstructionTypes() {
    if (confirm('삭제하시겠습니까?')) {
      const a = this.grist

      const ids = this.grist.selected.map(record => record.id)
      if (ids && ids.length > 0) {
        const response = await client.mutate({
          mutation: gql`
            mutation DeleteConstructionTypes($ids: [String!]!) {
              deleteConstructionTypes(ids: $ids)
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
