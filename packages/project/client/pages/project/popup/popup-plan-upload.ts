import '@material/web/icon/icon.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/button/elevated-button.js'

import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { BuildingLevel } from '../project-list'

@customElement('popup-plan-upload')
export class PopupPlanUpload extends LitElement {
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
            min-height: 50px;
            height: 70px;
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

  @property({ type: Object }) private buildingLevel: BuildingLevel = {}

  render() {
    const noUploadStyle = '--file-uploader-icon-size: 0; --file-uploader-label-padding; 0;'

    const mainDrawing = this.buildingLevel.mainDrawing
    const mainDrawingIcon = mainDrawing ? '' : 'upload'
    const mainDrawingStyle = mainDrawing ? noUploadStyle : ''

    const elevationDrawing = this.buildingLevel.elevationDrawing
    const elevationDrawingIcon = elevationDrawing ? '' : 'upload'
    const elevationDrawingStyle = elevationDrawing ? noUploadStyle : ''

    const rebarDistributionDrawing = this.buildingLevel.rebarDistributionDrawing
    const rebarDistributionDrawingIcon = rebarDistributionDrawing ? '' : 'upload'
    const rebarDistributionDrawingStyle = rebarDistributionDrawing ? noUploadStyle : ''

    return html`
      <div body>
        <div input-container>
          <ox-input-file
            name="mainDrawing"
            .value=${mainDrawing || undefined}
            icon=${mainDrawingIcon}
            label="업로드"
            description="평면 파일"
            @change=${this._onChangeAttachment.bind(this)}
            style=${mainDrawingStyle}
          ></ox-input-file>

          <ox-input-file
            name="elevationDrawing"
            .value=${elevationDrawing || undefined}
            icon=${elevationDrawingIcon}
            label="업로드"
            description="입면 파일"
            @change=${this._onChangeAttachment.bind(this)}
            style=${elevationDrawingStyle}
          ></ox-input-file>

          <ox-input-file
            name="rebarDistributionDrawing"
            .value=${rebarDistributionDrawing || undefined}
            icon=${rebarDistributionDrawingIcon}
            label="업로드"
            description="철근배근도 파일"
            @change=${this._onChangeAttachment.bind(this)}
            style=${rebarDistributionDrawingStyle}
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

  // 이미지 업로드
  async _onChangeAttachment(e: CustomEvent) {
    const target = e.target as HTMLInputElement
    const file = e.detail[0] || null

    this.buildingLevel[target.name] = file
    this.buildingLevel[`${target.name}Upload`] = file

    this.buildingLevel = { ...this.buildingLevel }

    target.dispatchEvent(new CustomEvent('file_change', { bubbles: false, detail: this.buildingLevel }))
  }
}
