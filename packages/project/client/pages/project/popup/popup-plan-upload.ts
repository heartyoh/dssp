import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
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

  @property({ type: Object }) private buildingLevel: BuildingLevel = {}
  @property({ type: Number }) private selectedIdx: number | undefined

  render() {
    const noUploadStyle = '--file-uploader-icon-size: 0; --file-uploader-label-padding; 0;'

    // 메인 도면 스타일
    const { mainDrawing, mainDrawingThumbnail } = this.buildingLevel
    const mainDrawingIcon = mainDrawing ? '' : 'upload'
    const mainDrawingStyle = mainDrawing ? noUploadStyle : ''
    const mainDrawingLabel = mainDrawingThumbnail ? ' ' : '업로드'
    const mainDrawingDesc = mainDrawingThumbnail ? ' ' : '평면 파일'
    const mainDrawingThumbnailStyle = mainDrawingThumbnail ? this._getThumbnailStyle(mainDrawingThumbnail) : ''

    // 입면 도면 스타일
    const { elevationDrawing, elevationDrawingThumbnail } = this.buildingLevel
    const elevationDrawingIcon = elevationDrawing ? '' : 'upload'
    const elevationDrawingLabel = elevationDrawingThumbnail ? ' ' : '업로드'
    const elevationDrawingDesc = elevationDrawingThumbnail ? ' ' : '입면 파일'
    const elevationDrawingStyle = elevationDrawing ? noUploadStyle : ''
    const elevationDrawingThumbnailStyle = elevationDrawingThumbnail ? this._getThumbnailStyle(elevationDrawingThumbnail) : ''

    // 철근배근도 도면 스타일
    const { rebarDistributionDrawing, rebarDistributionDrawingThumbnail } = this.buildingLevel
    const rebarDistributionDrawingIcon = rebarDistributionDrawing ? '' : 'upload'
    const rebarDistributionDrawingStyle = rebarDistributionDrawing ? noUploadStyle : ''
    const rebarDistributionDrawingLabel = rebarDistributionDrawingThumbnail ? ' ' : '업로드'
    const rebarDistributionDrawingDesc = rebarDistributionDrawingThumbnail ? ' ' : '철근배근도 파일'
    const rebarDistributionDrawingThumbnailStyle = rebarDistributionDrawingThumbnail
      ? this._getThumbnailStyle(rebarDistributionDrawingThumbnail)
      : ''

    return html`
      <div body>
        <div input-container>
          <ox-input-file
            name="mainDrawing"
            .value=${mainDrawing || undefined}
            icon=${mainDrawingIcon}
            label=${mainDrawingLabel}
            description=${mainDrawingDesc}
            @change=${this._onChangeAttachment.bind(this)}
            style="${mainDrawingStyle + mainDrawingThumbnailStyle}"
          ></ox-input-file>

          <ox-input-file
            name="elevationDrawing"
            .value=${elevationDrawing || undefined}
            icon=${elevationDrawingIcon}
            label=${elevationDrawingLabel}
            description=${elevationDrawingDesc}
            @change=${this._onChangeAttachment.bind(this)}
            style="${elevationDrawingStyle + elevationDrawingThumbnailStyle}"
          ></ox-input-file>

          <ox-input-file
            name="rebarDistributionDrawing"
            .value=${rebarDistributionDrawing || undefined}
            icon=${rebarDistributionDrawingIcon}
            label=${rebarDistributionDrawingLabel}
            description=${rebarDistributionDrawingDesc}
            @change=${this._onChangeAttachment.bind(this)}
            style="${rebarDistributionDrawingStyle + rebarDistributionDrawingThumbnailStyle}"
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

    const detail = { buildingLevel: this.buildingLevel, selectedIdx: this.selectedIdx }
    this.dispatchEvent(new CustomEvent('file_change', { bubbles: false, detail: detail }))
  }

  private _getThumbnailStyle(path) {
    return `background: url(${path}); background-size: cover; background-repeat: round; justify-content: flex-end;`
  }
}
