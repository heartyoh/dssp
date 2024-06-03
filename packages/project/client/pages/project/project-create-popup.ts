import '@material/mwc-icon'
import '@operato/data-grist'

import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { client } from '@operato/graphql'
import { i18next, localize } from '@operato/i18n'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/button/elevated-button.js'

@customElement('project-create-popup')
export class ProjectCreatePopup extends localize(i18next)(LitElement) {
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

        label {
          color: #4e5055;
          font-size: 16px;
        }

        div[input-container] {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 22px;

          md-outlined-text-field {
            width: 60%;
            margin-left: 15px;

            --md-outlined-text-field-container-shape: 9px;
            --md-sys-color-primary: #586878;
            --md-sys-color-surface-container-highest: transparent;
            --md-outlined-text-field-label-text-color: #999999;
            --md-outlined-text-field-input-text-line-height: 20px;
            --md-outlined-text-field-input-text-size: 16px;
            --md-outlined-field-bottom-space: 10px;
            --md-outlined-field-top-space: 10px;
          }
        }

        div[button-container] {
          margin-top: 50px;
          margin-bottom: 20px;
          text-align: center;

          md-elevated-button {
            margin: 0px 5px;

            --md-elevated-button-container-height: 40px;
            --md-elevated-button-container-color: #fff;
            --md-elevated-button-label-text-size: 16px;
          }
          md-elevated-button:first-child {
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

  @state() private projectName: string = ''
  @property({ type: Function }) private refreshFn!: Function

  render() {
    return html`
      <div body>
        <div input-container>
          <label>프로젝트 이름</label>
          <md-outlined-text-field
            name="projectName"
            type="text"
            placeholder="신규 프로젝트명"
            .value=${this.projectName}
            @input=${this._onInputChange}
          >
          </md-outlined-text-field>
        </div>

        <div button-container>
          <md-elevated-button @click=${this._createProject}>
            <md-icon slot="icon">add</md-icon>프로젝트 생성
          </md-elevated-button>
          <md-elevated-button @click=${this._close}> <md-icon slot="icon">close</md-icon>취소 </md-elevated-button>
        </div>
      </div>
    `
  }

  // 프로젝트 생성
  private async _createProject() {
    if (!this.projectName) {
      notify({ level: 'warn', message: '프로젝트 이름은 필수 값 입니다.' })
      return
    }

    const response = await client.mutate({
      mutation: gql`
        mutation CreateProject($project: NewProject!) {
          response: createProject(project: $project) {
            id
          }
        }
      `,
      variables: {
        project: {
          name: this.projectName
        }
      }
    })

    if (!response.errors) {
      notify({ message: '저장되었습니다.' })
    }

    // 설정 정보 리스트 다시 조회
    this.refreshFn()

    // 팝업 템플릿을 닫기 위한 동작
    history.back()
  }

  private _close() {
    history.back()
  }

  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent) {
    const target = event.target as HTMLInputElement
    this.projectName = target.value
  }
}
