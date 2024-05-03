import '@material/mwc-icon'
import '@operato/data-grist'

import { CommonHeaderStyles, ScrollbarStyles } from '@operato/styles'
import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { client } from '@operato/graphql'
import { i18next, localize } from '@operato/i18n'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'

@customElement('project-create-popup')
export class ProjectCreatePopup extends localize(i18next)(LitElement) {
  static styles = [
    ScrollbarStyles,
    CommonHeaderStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        background-color: var(--main-section-background-color);
        width: 100%;
      }

      .header .filters {
        flex-direction: column;
        align-items: start;
      }

      input {
        border: var(--border-dark-color);
        padding: var(--padding-narrow) var(--padding-default);
        max-width: 100px;
        font: var(--input-font);
      }
    `
  ]

  @state() private projectName: string = ''
  @property({ type: Function }) private refreshFn!: Function

  render() {
    return html`
      <div class="header">
        <label>${i18next.t('label.project_name')}</label>
        <input type="text" name="projectName" .value=${this.projectName} @input=${this._onInputChange} />
        <button @click=${this._createProject}>${i18next.t('button.project_create')}</button>
      </div>
    `
  }

  private async _createProject() {
    console.log('this.projectName : ', this.projectName)

    const response = await client.mutate({
      mutation: gql`
        mutation CreateProject($projectName: String!) {
          response: createProject(projectName: $projectName)
        }
      `,
      variables: {
        projectName: this.projectName
      }
    })

    if (!response.errors) {
      notify({ message: i18next.t('text.info_x_successfully', { x: i18next.t('text.save') }) })
    }

    // 설정 정보 리스트 다시 조회
    this.refreshFn()

    // 팝업 템플릿을 닫기 위한 동작
    history.back()
  }

  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent) {
    const target = event.target as HTMLInputElement
    this.projectName = target.value
  }
}
