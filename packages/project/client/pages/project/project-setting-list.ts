import '@operato/data-grist'

import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { i18next, localize } from '@operato/i18n'
import { openPopup } from '@operato/layout'

import gql from 'graphql-tag'
import './project-create-popup'

@customElement('project-setting-list')
export class ProjectSettingList extends localize(i18next)(ScopedElementsMixin(PageView)) {
  static styles = [
    css`
      :host {
        display: flex;

        width: 100%;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }
    `
  ]

  get context() {
    return {
      title: i18next.t('title.project_setting_list')
    }
  }

  @state() private projectName: string = ''
  @state() private projectList: any[] = []
  @state() private projectCount: number = 0

  render() {
    return html`
      <div main>
        <div header>
          <label>프로젝트 이름 (검색)</label>
          <input type="text" name="projectName" .value=${this.projectName} @input=${this._onInputChange} />
          <label>총 ${this.projectCount}개</label>
          <button @click=${this._openCreateProjectPopup}>+ 신규 프로젝트 추가</button>
        </div>
        <div body>
          ${this.projectList?.map(project => {
            return html` <div><a href="project-update/${project.id}">${project.name}</a></div> `
          })}
        </div>
      </div>
    `
  }

  async pageInitialized(lifecycle: any) {
    this.getProjectList()
  }

  async pageUpdated(changes: any, lifecycle: any) {
    if (this.active) {
      // do something here when this page just became as active
    }
  }

  async getProjectList() {
    const response = await client.query({
      query: gql`
        query Projects($projectName: String!) {
          projects(projectName: $projectName) {
            items {
              id
              name
              createdAt
            }
            total
          }
        }
      `,
      variables: {
        projectName: this.projectName || ''
      }
    })

    console.log('getProjectList : ', response.data)

    this.projectList = response.data.projects?.items || []
    this.projectCount = response.data.projects?.total || 0
  }

  private _openCreateProjectPopup() {
    openPopup(html`<project-create-popup .refreshFn=${this.getProjectList.bind(this)}></project-create-popup>`, {
      backdrop: true,
      size: 'small',
      title: i18next.t('title.project_create')
    })
  }

  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent) {
    const target = event.target as HTMLInputElement
    this[target.name] = target.value
  }
}
