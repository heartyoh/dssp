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
import './checklist-view'

@customElement('comment-list-popup')
class CommentListPopup extends connect(store)(LitElement) {
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

      div[comments-container] {
        overflow-y: auto;
        gap: 10px;
        display: flex;
        flex-direction: column;
        flex: 1;

        div[comment-row] {
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
            }
          }

          div[comment] {
            margin-left: 20px;
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

      textarea {
        height: 75px;
      }

      div[button-container] {
        display: flex;
        justify-content: flex-end;
        gap: 10px;

        md-elevated-button[blue] {
          --md-elevated-button-container-color: #0595e5;

          --md-elevated-button-label-text-color: #fff;
          --md-elevated-button-hover-label-text-color: #fff;
          --md-elevated-button-pressed-label-text-color: #fff;
          --md-elevated-button-focus-label-text-color: #fff;
          --md-elevated-button-icon-color: #fff;
          --md-elevated-button-hover-icon-color: #fff;
          --md-elevated-button-pressed-icon-color: #fff;
          --md-elevated-button-focus-icon-color: #fff;
        }
      }
    `
  ]

  @property({ type: String }) checklistItemId: string = ''

  @state() item: any = { count: 0 }
  @state() checklistItemComments: any = []
  @state() comment: string = ''
  @state() checklistItemCommentCount: number = 0
  @state() user: User = {}
  @state() page: number = 1
  @state() loading: boolean = false
  @state() hasMoreComments: boolean = true

  @query('div[comments-container]') commentsContainer!: HTMLDivElement

  render() {
    return html`
      <div body>
        <h3>제품검사에 대한 확인: ${this.checklistItemCommentCount || 0}건</h3>

        <div comments-container @scroll=${this._onScroll}>
          ${this.checklistItemComments.map(comment => {
            return html`
              <div comment-row>
                <div creator-container>
                  <span creator><md-icon slot="icon">account_circle</md-icon> ${comment.creator.name}</span>
                  <span createdAt>
                    <md-icon slot="icon">schedule</md-icon> ${this._formatDate(comment.createdAt)}
                    ${comment.creator.email === this.user.email
                      ? html` <md-icon delete slot="icon" @click=${() => this._deleteComment(comment.id)}>delete</md-icon>`
                      : ''}
                  </span>
                </div>
                <div comment>${comment.comment}</div>
              </div>
            `
          })}
        </div>

        <textarea .value=${this.comment || ''} @input=${this._onInputChange}></textarea>

        <div button-container>
          <md-elevated-button blue @click=${this._createComment}> <md-icon slot="icon">task</md-icon>저장 </md-elevated-button>
          <md-elevated-button @click=${this._close}> <md-icon slot="icon">cancel</md-icon>취소 </md-elevated-button>
        </div>
      </div>
    `
  }

  async firstUpdated() {
    this.user = (store.getState() as any).auth?.user
    this.comment = ''
    this.page = 1
    await this._loadComments()
    this._scrollBottom()
  }

  private async _loadComments() {
    if (this.loading || !this.hasMoreComments) return

    this.loading = true

    const response = await client.query({
      query: gql`
        query ChecklistItemComments($pagination: Pagination!, $checklistItemId: String!) {
          checklistItemComments(pagination: $pagination, checklistItemId: $checklistItemId) {
            id
            comment
            creator {
              id
              email
            }
            createdAt
          }

          checklistItem(id: $checklistItemId) {
            id
            checklistItemCommentCount
          }
        }
      `,
      variables: {
        checklistItemId: this.checklistItemId,
        pagination: {
          page: this.page,
          limit: 10
        }
      }
    })

    if (response.errors) return

    const items = response.data.checklistItemComments
    if (items.length < 10) this.hasMoreComments = false

    this.checklistItemComments = [...items.reverse(), ...this.checklistItemComments]
    this.page += 1
    this.checklistItemCommentCount = response.data.checklistItem.checklistItemCommentCount
    this.loading = false
  }

  // 스크롤이 맨 위에 가까울 때 데이터 요청
  private _onScroll() {
    const { scrollTop } = this.commentsContainer
    if (scrollTop <= 5) {
      this._loadComments()
    }
  }

  private async _createComment() {
    if (!this.comment) {
      notify({ message: '조치사항을 입력해주세요.', level: 'warn' })
      return
    }

    const response = await client.mutate({
      mutation: gql`
        mutation CreateChecklistItemComment($checklistItemComment: NewChecklistItemComment!) {
          createChecklistItemComment(checklistItemComment: $checklistItemComment) {
            id
            comment
            creator {
              id
              email
            }
            createdAt
          }
        }
      `,
      variables: {
        checklistItemComment: {
          comment: this.comment,
          checklistItemId: this.checklistItemId
        }
      }
    })

    if (!response.errors) {
      this.comment = ''
      this.checklistItemComments = [...this.checklistItemComments, { ...response.data.createChecklistItemComment }]
      this._scrollBottom()
      this.checklistItemCommentCount++
    } else {
      notify({ message: response.errors?.[0]?.message || '조치사항 등록에 실패하였습니다.', level: 'error' })
    }

    this._dispatchEvent()
  }

  private async _deleteComment(commentId: string) {
    if (
      await OxPrompt.open({
        title: '조치 사항을 삭제',
        text: '조치 사항을 삭제 하시겠습니까?',
        confirmButton: { text: '삭제' },
        cancelButton: { text: '취소' }
      })
    ) {
      const response = await client.mutate({
        mutation: gql`
          mutation DeleteChecklistItemComment($id: String!) {
            deleteChecklistItemComment(id: $id)
          }
        `,
        variables: {
          id: commentId
        }
      })

      if (!response.errors) {
        this.checklistItemComments = [...this.checklistItemComments.filter(comment => comment.id != commentId)]
        notify({ message: '조치사항을 삭제하였습니다.', level: 'info' })
      } else {
        notify({ message: response.errors?.[0]?.message || '조치사항 삭제에 실패하였습니다.', level: 'error' })
      }

      this._dispatchEvent()
    }
  }

  private _close() {
    history.back()
  }

  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent) {
    const target = event.target as HTMLInputElement
    this.comment = target.value
  }

  private _formatDate(date) {
    console.log('date :', date)
    const _date = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))

    const year = _date.getFullYear()
    const month = String(_date.getMonth() + 1).padStart(2, '0')
    const day = String(_date.getDate()).padStart(2, '0')
    const hours = String(_date.getHours()).padStart(2, '0')
    const minutes = String(_date.getMinutes()).padStart(2, '0')
    const seconds = String(_date.getSeconds()).padStart(2, '0')

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
  }

  // 댓글 스크롤 맨 밑으로
  private async _scrollBottom() {
    setTimeout(() => {
      this.commentsContainer.scrollTop = this.commentsContainer.scrollHeight
    }, 100)
  }

  // 조치사항 변경 이벤트 디스패치
  _dispatchEvent() {
    this.dispatchEvent(new CustomEvent('change-comment', { detail: { checklistItemId: this.checklistItemId } }))
  }
}
