import '@material/web/icon/icon.js'
import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ButtonContainerStyles, ScrollbarStyles } from '@operato/styles'

@customElement('building-inspection-detail-header')
class BuildingInspectionDetailHeader extends LitElement {
  static styles = [
    ButtonContainerStyles,
    ScrollbarStyles,
    css`
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
        margin: 0px var(--spacing-large, 12px);
      }

      h2 {
        flex: 0.5;
        color: #3f71a0;
        font-size:18px;
      }

      div[button-container] {
        display: flex;
        align-items: center;
        justify-content: end;
        flex: 0.5;
      }

      md-elevated-button {
        margin-left: var(--spacing-small, 4px);
        letter-spacing: -1px; 

        --md-elevated-button-container-height: 32px;
        --md-elevated-button-label-text-size: 16px;
        --md-elevated-button-container-color: #0595e5;

        --md-elevated-button-label-text-color: var(--md-sys-color-on-primary);
        --md-elevated-button-hover-label-text-color: var(--md-sys-color-on-primary);
        --md-elevated-button-pressed-label-text-color: var(--md-sys-color-on-primary);
        --md-elevated-button-focus-label-text-color: var(--md-sys-color-on-primary);
        --md-elevated-button-icon-color: var(--md-sys-color-on-primary);
        --md-elevated-button-hover-icon-color: var(--md-sys-color-on-primary);
        --md-elevated-button-pressed-icon-color: var(--md-sys-color-on-primary);
        --md-elevated-button-focus-icon-color: var(--md-sys-color-on-primary);
        --_leading-space:var(--spacing-tiny, 2px);

        --_with-leading-icon-leading-space: var(--spacing-medium, 8px);
        --_with-leading-icon-trailing-space: var(--spacing-medium, 8px);

        md-icon{
          margin-right: -2px;
        }
      }
    `
  ]

  @property({ type: String }) buildingInspectionId: string = ''
  @property({ type: String }) buildingLevelId: string = ''
  @property({ type: String }) projectName: string = ''
  @property({ type: String }) buildingName: string = ''
  @property({ type: String }) buildingLevelFloor: string = ''

  render() {
    const path = window.location.pathname

    return html`
      <div header>
        <h2>${this.projectName || ''} ${this.buildingName || ''} ${this.buildingLevelFloor || ''}층</h2>
        <div button-container>
          <md-elevated-button
            ?disabled=${path.includes('building-inspection-list/')}
            href=${`building-inspection-list/${this.buildingLevelId}`}
          >
            <md-icon slot="icon">list_alt</md-icon>검측 리스트
          </md-elevated-button>
          <md-elevated-button
            ?disabled=${path.includes('building-inspection-detail-drawing/')}
            href=${`building-inspection-detail-drawing/${this.buildingInspectionId}`}
          >
            <md-icon slot="icon">fact_check</md-icon>검측도면
          </md-elevated-button>
          <md-elevated-button
            ?disabled=${path.includes('building-inspection-detail-checklist/')}
            href=${`building-inspection-detail-checklist/${this.buildingInspectionId}`}
          >
            <md-icon slot="icon">task</md-icon>검측 체크리스트
          </md-elevated-button>
          <md-elevated-button
            ?disabled=${path.includes('building-inspection-detail-camera/')}
            href=${`building-inspection-detail-camera/${this.buildingInspectionId}`}
            disabled
          >
            <md-icon slot="icon">photo_camera</md-icon>사진촬영
          </md-elevated-button>
          <md-elevated-button
            ?disabled=${path.includes('building-inspection-detail-history/')}
            href=${`building-inspection-detail-history/${this.buildingInspectionId}`}
            disabled
          >
            <md-icon slot="icon">pending_actions</md-icon>감리이력
          </md-elevated-button>
        </div>
      </div>
    `
  }
}
