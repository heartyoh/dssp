import '@operato/data-grist'

import { CommonButtonStyles, CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { DataGrist } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'

@customElement('manager-management')
export class ManagerManagement extends PageView {
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
      title: '담당자 관리',
      actions: [
        {
          title: '저장',
          action: this._updateManagers.bind(this),
          ...CommonButtonStyles.save
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
          name: 'phone',
          header: '휴대폰 번호',
          record: {
            editable: true
          },
          width: 150
        },
        {
          type: 'string',
          name: 'position',
          header: '직위',
          record: {
            editable: true
          },
          width: 150
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: '수정 시간',
          record: {
            renderer: value => {
              const date = new Date(value + ' UTC')

              return new Intl.DateTimeFormat('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }).format(date)
            }
          },
          width: 200
        }
      ],
      rows: {
        appendable: false
      },
      sorters: [{ name: 'name' }],
      pagination: { infinite: true }
    }
  }

  async fetchHandler() {
    const response = await client.query({
      query: gql`
        query Managers {
          managers {
            id
            phone
            position
            userId
            name
            updatedAt
          }
        }
      `
    })

    console.log('response.data.managers :', response.data.managers)

    if (response.errors) return {}

    return {
      total: response.data.managers.length || 0,
      records: response.data.managers || []
    }
  }

  async _updateManagers() {
    let patches = this.grist.dirtyRecords
    if (patches && patches.length) {
      patches = patches.map(patch => {
        let patchField: any = patch.userId ? { userId: patch.userId } : {}
        if (patch.id) patchField['id'] = patch.id

        const dirtyFields = patch.__dirtyfields__
        for (let key in dirtyFields) {
          patchField[key] = dirtyFields[key].after
        }

        return patchField
      })

      const response = await client.mutate({
        mutation: gql`
          mutation UpdateMultipleManager($patches: [ManagerPatch!]!) {
            updateMultipleManager(patches: $patches) {
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
