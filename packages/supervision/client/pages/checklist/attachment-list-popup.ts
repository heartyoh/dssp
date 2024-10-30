import '@material/web/icon/icon.js'
import gql from 'graphql-tag'
import { client } from '@operato/graphql'
import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { ButtonContainerStyles, ScrollbarStyles } from '@operato/styles'
import { notify } from '@operato/layout'
import { store, User } from '@operato/shell'
import { connect } from 'pwa-helpers/connect-mixin.js'
import { OxPrompt } from '@operato/popup/ox-prompt.js'
import { openPopup } from '@operato/layout'
import './file-preview-popup'

@customElement('attachment-list-popup')
class AttachmentListPopup extends connect(store)(LitElement) {
  static styles = [
    ButtonContainerStyles,
    ScrollbarStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        padding: 15px 20px;
        background-color: var(--md-sys-color-surface);
      }

      div[body] {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      div[attachment-container] {
        overflow-y: auto;
        gap: 10px;
        display: flex;
        flex-direction: column;
        flex: 1;

        div[attachment-row] {
          display: flex;
          flex-direction: column;

          div[creator-container] {
            display: flex;
            justify-content: space-between;

            span[creator] {
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 3px;
            }
            span[createdAt] {
              display: flex;
              align-items: center;
              gap: 3px;

              md-icon[delete] {
                cursor: pointer;
              }

              a[button-download] {
                display: flex;
                color: #000;
              }
            }
          }

          a[attachment] {
            margin-left: 20px;
            text-decoration: none;
            color: #000;
          }
        }
      }

      h3 {
        position: relative;
        color: rgb(5, 149, 229);
        font-size: 17px;
        font-weight: 700;
        background-color: var(--md-sys-color-surface);
        margin-top: 0px;
        margin-bottom: 5px;
      }

      div[button-container] {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
    `
  ]

  @property({ type: String }) checklistItemId: string = ''

  @state() item: any = { count: 0 }
  @state() checklistItemAttachments: any = []
  @state() checklistItemAttachmentCount: number = 0
  @state() user: User = {}
  @query('div[attachment-container]') attachmentContainer!: HTMLDivElement

  render() {
    return html`
      <div body>
        <h3>제품검사에 대한 파일: ${this.checklistItemAttachmentCount || 0}건</h3>

        <div attachment-container>
          ${this.checklistItemAttachments.map(attachment => {
            return html`
              <div attachment-row>
                <div creator-container>
                  <span creator><md-icon slot="icon">account_circle</md-icon> ${attachment.creator.name}</span>
                  <span createdAt>
                    <md-icon slot="icon">schedule</md-icon> ${this._formatDate(attachment.createdAt)}
                    ${attachment.creator.email === this.user.email
                      ? html` <md-icon delete slot="icon" @click=${() => this._deleteAttachment(attachment.id)}>delete</md-icon>`
                      : ''}
                    <a button-download href=${attachment.fullpath} download=${attachment.name}>
                      <md-icon slot="icon">download</md-icon></a
                    >
                  </span>
                </div>
                <a attachment @click=${() => this._onClickPreview(attachment.fullpath)}>${attachment.name}</a>
              </div>
            `
          })}
        </div>

        <ox-input-file accept="*/*" multiple="true" hide-filelist @change=${this.onCreateAttachment.bind(this)}></ox-input-file>

        <div button-container>
          <md-elevated-button @click=${this._close}> <md-icon slot="icon">cancel</md-icon>취소 </md-elevated-button>
        </div>
      </div>
    `
  }

  async firstUpdated() {
    this.user = (store.getState() as any).auth?.user

    await this._loadAttachments()
  }

  private async _loadAttachments() {
    const response = await client.query({
      query: gql`
        query ChecklistItem($id: String!) {
          checklistItem(id: $id) {
            id
            checklistItemAttachmentCount
            checklistItemAttachments {
              id
              name
              fullpath
              creator {
                id
                name
                email
              }
              createdAt
            }
          }
        }
      `,
      variables: {
        id: this.checklistItemId
      }
    })

    if (response.errors) return

    this.checklistItemAttachments = response.data.checklistItem.checklistItemAttachments || []
    this.checklistItemAttachmentCount = response.data.checklistItem.checklistItemAttachmentCount
  }

  private async _deleteAttachment(attachmentId: string) {
    if (
      await OxPrompt.open({
        title: '첨부 자료를 삭제',
        text: '첨부 자료를 삭제 하시겠습니까?',
        confirmButton: { text: '삭제' },
        cancelButton: { text: '취소' }
      })
    ) {
      const response = await client.mutate({
        mutation: gql`
          mutation DeleteAttachment($deleteAttachmentId: String!) {
            deleteAttachment(id: $deleteAttachmentId)
          }
        `,
        variables: {
          deleteAttachmentId: attachmentId
        }
      })

      if (!response.errors) {
        this.checklistItemAttachments = [...this.checklistItemAttachments.filter(attachment => attachment.id != attachmentId)]
        notify({ message: '첨부 자료를 삭제하였습니다.', level: 'info' })
      } else {
        notify({ message: response.errors?.[0]?.message || '첨부 자료 삭제에 실패하였습니다.', level: 'error' })
      }

      this._dispatchEvent()
    }
  }

  private _close() {
    history.back()
  }

  // 파일 변경 시 파일을 저장할 핸들러
  private async onCreateAttachment(e: CustomEvent) {
    const files = e.detail

    await this._createAttachments(files)

    this._dispatchEvent()
  }

  async _createAttachments(files: File[]) {
    const checklistItemId = this.checklistItemId

    const response = await client.mutate({
      mutation: gql`
        mutation ($attachments: [NewAttachment!]!) {
          createAttachments(attachments: $attachments) {
            id
            name
            fullpath
            creator {
              id
              name
              email
            }
            createdAt
          }
        }
      `,
      variables: {
        attachments: files.map(file => {
          return { file, refBy: checklistItemId, refType: 'ChecklistItem' }
        })
      },
      context: {
        hasUpload: true
      }
    })

    const attachments = response.data.createAttachments

    this.checklistItemAttachments = [...attachments, ...this.checklistItemAttachments]
    this.checklistItemAttachmentCount = this.checklistItemAttachmentCount + attachments.length
  }

  private _formatDate(date) {
    const _date = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))

    const year = _date.getFullYear()
    const month = String(_date.getMonth() + 1).padStart(2, '0')
    const day = String(_date.getDate()).padStart(2, '0')
    const hours = String(_date.getHours()).padStart(2, '0')
    const minutes = String(_date.getMinutes()).padStart(2, '0')
    const seconds = String(_date.getSeconds()).padStart(2, '0')

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
  }

  // 첨부 자료 변경 이벤트 디스패치
  _dispatchEvent() {
    this.dispatchEvent(new CustomEvent('change-attachment', { detail: { checklistItemId: this.checklistItemId } }))
  }

  private _onClickPreview(filepath: string) {
    openPopup(html` <file-preview-popup .filepath=${filepath}></file-preview-popup> `, {
      backdrop: true,
      size: 'large',
      title: '미리보기'
    })
  }
}
