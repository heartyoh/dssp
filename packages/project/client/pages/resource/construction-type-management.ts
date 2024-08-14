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

  @property({ type: Object }) gristConfig: any
  @query('ox-grist') private grist!: DataGrist

  get context() {
    return {
      title: '공종 관리'
    }
  }

  render() {
    return html`
      <ox-grist .mode=${'GRID'} .config=${this.gristConfig} .fetchHandler=${this.fetchHandler.bind(this)}> </ox-grist>
      <div button-container>
        <md-elevated-button @click=${this._updateConstructionTypes.bind(this)}>
          <md-icon slot="icon">save</md-icon>저장</md-elevated-button
        >
        <md-elevated-button red @click=${this._deleteConstructionTypes.bind(this)}>
          <md-icon slot="icon">delete</md-icon>삭제</md-elevated-button
        >
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
