import '@material/web/icon/icon.js'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ButtonContainerStyles, ScrollbarStyles } from '@operato/styles'

@customElement('project-update-header')
class ProjectUpdateHeader extends LitElement {
  static styles = [
    ButtonContainerStyles,
    ScrollbarStyles,
    css`
      div[header] {
        display: flex;
        margin: 0px 20px;

        h2 {
          flex: 0.5;
          color: #3f71a0;
        }
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

          &[green] {
            --md-elevated-button-container-color: #42b382;
          }
        }
      }
    `
  ]

  @property({ type: String }) projectId: string = ''
  @property({ type: String }) title: string = ''

  render() {
    const path = window.location.pathname

    return html`
      <div header>
        <h2>${this.title}</h2>
        <div button-container>
          <md-elevated-button green @click=${this._dispatchEvent} ?disabled=${!this.projectId}>
            <md-icon slot="icon">save</md-icon>정보 저장
          </md-elevated-button>
          <md-elevated-button
            href=${`project-update/${this.projectId}`}
            ?disabled=${!this.projectId || path.includes('project-update/')}
          >
            <md-icon slot="icon">assignment</md-icon>프로젝트 정보 수정
          </md-elevated-button>
          <md-elevated-button
            href=${`project-plan-management/${this.projectId}`}
            ?disabled=${!this.projectId || path.includes('project-plan-management/')}
          >
            <md-icon slot="icon">description</md-icon>도면 관리
          </md-elevated-button>
        </div>
      </div>
    `
  }

  private _dispatchEvent() {
    this.dispatchEvent(new CustomEvent('custom-click'))
  }
}
