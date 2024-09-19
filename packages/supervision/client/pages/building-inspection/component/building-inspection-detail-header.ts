import '@material/web/icon/icon.js'
import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ButtonContainerStyles, ScrollbarStyles } from '@operato/styles'

@customElement('building-inspection-detail-header')
class buildingInspectionDetailHeader extends LitElement {
  static styles = [
    ButtonContainerStyles,
    ScrollbarStyles,
    css`
      :host {
      }

      md-filled-button {
        --md-filled-button-container-color: #0595e5;
        --md-filled-button-container-height: 30px;
        --md-filled-button-trailing-space: 15px;
        --md-filled-button-leading-space: 15px;
      }
      md-outlined-button {
        --md-outlined-button-container-height: 30px;
        --md-outlined-button-trailing-space: 15px;
        --md-outlined-button-leading-space: 15px;
      }

      *[bold] {
        font-weight: bold;
      }

      div[header] {
        display: flex;
        margin: 0px 20px;

        h2 {
          flex: 0.5;
          color: #3f71a0;
        }

        div[button-container] {
          display: flex;
          align-items: center;
          justify-content: end;
          flex: 0.5;

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
          }
        }
      }
    `
  ]

  @property({ type: Object }) gristConfig: any
  @property({ type: Object }) checklistDetailTypes: any
  @property({ type: String }) projectId: string = ''
  @property({ type: String }) checklistTemplateId: string = ''

  @state() buildingInspectionId: string = ''
  @state() projectName: string = ''
  @state() buildingName: string = ''
  @state() buildingLevelFloor: string = ''

  render() {
    return html`
      <div header>
        <h2>${this.projectName || ''} ${this.buildingName || ''} ${this.buildingLevelFloor || ''}층</h2>
        <div button-container>
          <md-elevated-button href=${`building-inspection-detail-drawing/${this.buildingInspectionId}`}>
            <md-icon slot="icon">assignment</md-icon>검측도면
          </md-elevated-button>
          <md-elevated-button href=${`building-inspection-detail-checklist/${this.buildingInspectionId}`}>
            <md-icon slot="icon">description</md-icon>검측 체크리스트
          </md-elevated-button>
          <md-elevated-button href=${`building-inspection-detail-photo/${this.buildingInspectionId}`}>
            <md-icon slot="icon">description</md-icon>사진촬영
          </md-elevated-button>
        </div>
      </div>
    `
  }
}
