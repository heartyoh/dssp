import '@material/web/icon/icon.js'
import '@material/web/button/elevated-button.js'
import '@material/web/button/outlined-button.js'
import '@material/web/progress/linear-progress.js'
import '@material/web/textfield/filled-text-field.js'

import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { openPopup } from '@operato/layout'

import gql from 'graphql-tag'
import './popup/popup-project-create'
import { Project } from './project-list'

@customElement('project-setting-list')
export class ProjectSettingList extends ScopedElementsMixin(PageView) {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        overflow-y: auto;

        width: 100%;
        height: 100%;
        background-color: var(--md-sys-color-background, #fcf8f8);

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }

      div[management-header-container] {
        display: flex;
        margin: var(--spacing-large, 12px);
        margin-bottom:0;
        gap: var(--spacing-medium, 8px);
        overflow-x: auto;

        a {
          flex:1;
          text-align: center;
          padding: var(--spacing-medium, 8px);
          background-color: var(--md-sys-color-on-primary);
          color: var(--md-sys-color-tertiary);
          font-weight: 700;
          border-radius: var(--md-sys-shape-corner-small, 5px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: var(--spacing-small, 4px);
          border: solid 1px #0000004d;
          text-decoration: none;
          cursor: pointer;

          md-icon {
            font-size: 35px;
            width: auto;
            height: auto;
          }
          div[label] {
            font-size: 14px;
            line-height:1.3;
          }
        }

        a[green] {
          background-color: #24be7b;
          color: var(--md-sys-color-on-primary);
        }
      }

      div[header] {
        display: flex;
        align-items: center;
        background-color: #2ea4df1a;
        border: 1px solid #2ea4df33;
        margin: var(--spacing-large, 12px);
        margin-bottom:var(--spacing-small, 5px);
        padding: var(--spacing-medium, 8px) var(--spacing-large, 12px);
        border-radius: var(--md-sys-shape-corner-small, 5px);

        md-filled-text-field[type='search'] {
          --md-filled-text-field-container-shape: 0px;
          --md-filled-text-field-container-color: transparent;
          --md-filled-text-field-label-text-color: #999999;
          --md-filled-text-field-input-text-color: #4e5055;
        }
        strong{
          flex:1;
          padding-right:var(--spacing-medium, 8px);
          text-align:right
        }

        md-elevated-button[add-project] {
          font-weight: bold;
          font-size: 16px;
          margin-left: 17px;
          padding: 13px 20px;

          --md-elevated-button-container-color: #24be7b;
          --md-elevated-button-label-text-color: #ffffff;
          --md-elevated-button-hover-label-text-color: #fff;
          --md-elevated-button-pressed-label-text-color: #fff;
          --md-elevated-button-focus-label-text-color: #fff;
          --md-elevated-button-icon-color: #fff;
          --md-elevated-button-hover-icon-color: #fff;
          --md-elevated-button-pressed-icon-color: #fff;
          --md-elevated-button-focus-icon-color: #fff;

          --md-elevated-button-container-shape: 7px;
        }
      }

      div[body] {
        div[project-container] {
          display: flex;
          flex-direction: row;
          min-height: 130px;
          margin: var(--spacing-large, 12px);
          background-color: var(--md-sys-color-on-primary);
          border: 1px solid #cccccc80;
          border-radius: var(--md-sys-shape-corner-small, 5px);
          align-items: center;
          gap: var(--spacing-medium, 8px);
          overflow:hidden;

          img[project-img] {
            width: 240px;
            height: 130px;
            aspect-ratio: 2;
            background-color: #cccccc80;
          }
          img[project-img][no-image] {
            object-fit: contain;
            opacity: 0.5;
          }

          span[project-info] {
            flex: 0.5;
            padding: var(--spacing-small, 4px);
            font-size: 14px;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            div[name] {
              color: #2e79be;
              font-weight: bold;
              font-size: 18px;
            }
          }

          span[project-state] {
            flex: 0.5;
            padding: var(--spacing-medium, 8px);
            min-width: 340px;

            & > div {
              margin-bottom: var(--spacing-small, 4px);
            }

            div[progress] {
              position: relative;

              md-linear-progress {
                margin:var(--spacing-tiny, 2px) 0;
                --md-linear-progress-track-height: 18px;
                --md-linear-progress-active-indicator-height: 18px;
                --md-linear-progress-track-shape: 5px;
                --md-linear-progress-active-indicator-color: #0595e526;
                --md-linear-progress-track-color: #0595e52a;
              }

              span {
                position: absolute;
                top: 0;
                left: var(--spacing-large, 12px);
                font-size: 12px;
                font-weight: bold;
                color: #2e79be;

                &:last-child {
                  left: unset;
                  right: var(--spacing-large, 12px);
                }
              }
            }

            div[filled] div {
              margin-right: var(--spacing-large, 12px);
              display: inline-block;
            }

            strong[filled] {
              color: #1bb401;
            }
            strong[not-filled] {
              color: #ff4444;
            }

            md-outlined-button {
              min-height: 33px;
              padding: 0 var(--spacing-large, 12px);
              margin-right: var(--spacing-tiny, 2px);
              box-shadow: 1px 1px 1px 1px #0000001a;
              --md-outlined-button-label-text-color: #586878;
              --md-outlined-button-label-text-weight: bold;
              --md-sys-color-outline: rgba(51,51,51,.20);
            }
          }
        }
      }
    `
  ]

  get context() {
    return {
      title: '셋팅'
    }
  }

  @state() private projectName: string = ''
  @state() private projectList: Project[] = []
  @state() private projectCount: number = 0

  render() {
    return html`
      <div management-header>
        <div management-header-container>
          <a @click=${this._openCreateProjectPopup} green>
            <md-icon slot="leading-icon">add</md-icon>
            <div label>신규 프로젝트 생성</div>
          </a>
          <a href="employee-list">
            <md-icon slot="leading-icon">badge</md-icon>
            <div label>인력 관리</div>
          </a>
          <a href="construction-type-management">
            <md-icon slot="leading-icon">construction</md-icon>
            <div label>공종 관리</div>
          </a>
          <a href="inspection-drawing-type-management">
            <md-icon slot="leading-icon">stacks</md-icon>
            <div label>도면타입/검측부위<br/>관리</div>
          </a>
          <a href="checklist-type-management">
            <md-icon slot="leading-icon">rule</md-icon>
            <div label>체크리스트 구분 관리</div>
          </a>
          <a href="checklist-template-list">
            <md-icon slot="leading-icon">fact_check</md-icon>
            <div label>체크리스트 템플릿<br/>관리</div>
          </a>
        </div>
      </div>

      <div header>
        <md-filled-text-field
          name="projectName"
          type="search"
          label="프로젝트 이름"
          .value=${this.projectName}
          @input=${this._onInputChange}
          @keypress=${this._onKeypress}
        >
          <md-icon slot="leading-icon">search</md-icon>
        </md-filled-text-field>

        <strong>총 ${this.projectCount}개</strong>
      </div>

      <div body>
        ${this.projectList?.map((project: Project) => {
          const filledText = html`<strong filled>등록완료</strong>`
          const nonFilledText = html`<strong not-filled>미등록</strong>`

          const projectFilledState = project.buildingComplex.address ? filledText : nonFilledText
          const supervisoryFilledState = true ? filledText : nonFilledText
          const taskFilledState = false ? filledText : nonFilledText

          return html`
            <div project-container>
              <img
                ?no-image=${!project.mainPhoto?.fullpath}
                project-img
                src=${project.mainPhoto?.fullpath || '/assets/images/no-image.png'}
              />

              <span project-info>
                <div name>${project.name}</div>
                <div content>${project.buildingComplex.address}</div>
                <div content>면적: ${project.buildingComplex?.area?.toLocaleString() || ''}㎡</div>
                <div content>착공~준공: ${project.startDate}~${project.endDate}</div>
                <div content>발주처: <strong>${project.buildingComplex.clientCompany}</strong></div>
              </span>

              <span project-state>
                <div progress>
                  <md-linear-progress buffer="100" max="100" value=${project.totalProgress || 0}> </md-linear-progress>
                  <span>${project.totalProgress == 100 ? '완료' : '진행중'}</span>
                  <span>${project.totalProgress || 0}%</span>
                </div>
                <div filled>
                  <div>프로젝트 정보 ${projectFilledState}</div>
                  <div>시공감리 자료 ${supervisoryFilledState}</div>
                  <div>공정표 ${taskFilledState}</div>
                </div>
                <div>
                  <md-outlined-button href="project-update/${project.id}">프로젝트 정보 수정</md-outlined-button>
                  <md-outlined-button href="project-plan-management/${project.id}">도면 관리</md-outlined-button>
                  <md-outlined-button href="project-task-management/${project.id}">공정표 관리</md-outlined-button>
                </div>
              </span>
            </div>
          `
        })}
      </div>
    `
  }

  async pageUpdated(changes: any, lifecycle: any) {
    if (this.active) {
      this.getProjectList()
    }
  }

  async getProjectList() {
    const response = await client.query({
      query: gql`
        query Projects($filters: [Filter!]) {
          projects(filters: $filters) {
            items {
              id
              name
              mainPhoto {
                fullpath
              }
              startDate
              endDate
              totalProgress
              buildingComplex {
                address
                area
                clientCompany
              }
            }
            total
          }
        }
      `,
      variables: {
        filters: this.projectName
          ? [
              {
                name: 'name',
                operator: 'search',
                value: `%${this.projectName}%`
              }
            ]
          : []
      }
    })

    this.projectList = response.data.projects?.items || []
    this.projectCount = response.data.projects?.total || 0
  }

  private _openCreateProjectPopup() {
    openPopup(html`<popup-project-create .refreshFn=${this.getProjectList.bind(this)}></popup-project-create>`, {
      backdrop: true,
      size: 'small',
      title: '신규 프로젝트 생성'
    })
  }

  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent) {
    const target = event.target as HTMLInputElement
    this[target.name] = target.value
  }

  // 검색창에서 엔터입력시 검색
  private _onKeypress(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.getProjectList()
    }
  }
}
