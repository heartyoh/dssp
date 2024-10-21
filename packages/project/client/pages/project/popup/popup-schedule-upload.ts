import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'
import { Attachment } from '@things-factory/attachment-base'

@customElement('popup-schedule-upload')
export class PopupScheduleUpload extends LitElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        background-color: #fff;
        width: 100%;
      }

      div[body] {
        flex: 1;

        div[input-container] {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          background-color: #f7f7f7;
          padding: 35px 27px 27px 27px;

          ox-input-file {
            height: 100px;
            width: 120px;
            line-height: 100%;
          }
        }

        div[button-container] {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
        }
      }
    `
  ]

  @property({ type: Object }) private scheduleTable: Attachment | undefined
  @property({ type: String }) private projectId: string | undefined

  render() {
    const icon = this.scheduleTable ? '' : 'upload'
    const description = this.scheduleTable?.name ? ' ' : '공정표 업로드'

    return html`
      <div body>
        <div input-container>
          <ox-input-file
            icon=${icon}
            label=${this.scheduleTable?.name || ''}
            description=${description}
            @change=${this._onChangeAttachment.bind(this)}
          ></ox-input-file>
        </div>

        <div button-container>
          <md-outlined-button @click=${this._close}><md-icon slot="icon">cancel</md-icon>취소</md-outlined-button>
        </div>
      </div>
    `
  }

  private _close() {
    history.back()
  }

  // 공정표 업로드
  async _onChangeAttachment(e: CustomEvent) {
    const file = e.detail[0] || null

    const response = await client.mutate({
      mutation: gql`
        mutation UploadProjectScheduleTable($param: UploadProjectScheduleTable!) {
          uploadProjectScheduleTable(param: $param)
        }
      `,
      variables: {
        param: {
          projectId: this.projectId,
          scheduleTable: file
        }
      },
      context: {
        hasUpload: true
      }
    })

    if (!response.errors) {
      notify({ message: '공정표가 업로드 되었습니다.' })
      this.dispatchEvent(new CustomEvent('uploaded'))
    }
  }
}
