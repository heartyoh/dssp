import '@material/web/icon/icon.js'

import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import gql from 'graphql-tag'
import { Project, ProjectState } from './project-list'

@customElement('project-completed-list')
export class ProjectCompletedListPage extends ScopedElementsMixin(PageView) {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        overflow-y: auto;

        width: 100%;
        height: 100%;
        background-color: #f7f7f7;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }

      div[header] {
        display: flex;
        height: 100px;
        align-items: center;
        background-color: #2ea4df1a;
        border: 1px solid #2ea4df33;
        margin: 15px 23px;
        font-size: 18px;
        padding: 7px;
        border-radius: 5px;

        md-filled-text-field[type='search'] {
          margin-left: 5px;
          margin-right: 26px;

          --md-filled-text-field-container-shape: 0px;
          --md-sys-color-primary: #006a6a;
          --md-sys-color-surface-container-highest: transparent;
          --md-filled-text-field-label-text-color: #999999;
          --md-filled-text-field-input-text-color: #4e5055;
        }

        md-elevated-button[add-project] {
          font-weight: bold;
          font-size: 16px;
          margin-left: 17px;
          padding: 13px 20px;

          --md-sys-color-surface-container-low: #24be7b;
          --md-sys-color-primary: #ffffff;
          --md-elevated-button-container-shape: 7px;
        }
      }

      div[body] {
        div[project-container] {
          height: 140px;
          margin: 17px 23px;
          background-color: #ffffff;
          border: 1px solid #cccccc80;
          border-radius: 5px;

          & > a {
            display: flex;
            width: 100%;
            height: 100%;
            text-decoration: none;
            color: #000;
          }

          img[project-img] {
            width: 285px;
            background-color: #cccccc80;
          }
          img[project-img][no-image] {
            object-fit: contain;
            opacity: 0.5;
          }

          span[project-info] {
            flex: 0.45;
            padding: 6px 15px;
            font-size: 16px;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            div[name] {
              color: #2e79be;
              font-weight: bold;
              font-size: 19px;
              margin-bottom: 2px;
            }
          }

          span[project-state] {
            flex: 0.55;
            padding: 10px 20px;

            & > div {
              margin-bottom: 3px;
            }

            div[progress] {
              position: relative;

              md-linear-progress {
                --md-linear-progress-track-height: 18px;
                --md-linear-progress-active-indicator-height: 18px;
                --md-linear-progress-track-shape: 5px;
                --md-sys-color-primary: #1bb40133;
                --md-sys-color-surface-container-highest: #0595e533;
                --md-linear-progress-track-color: #1bb4011a;
              }

              span {
                position: absolute;
                top: 0;
                left: 12px;
                font-size: 12px;
                font-weight: bold;
                color: #1bb401;

                &:last-child {
                  left: unset;
                  right: 12px;
                }
              }
            }
          }
        }
      }
    `
  ]

  get context() {
    return {
      title: '완료 프로젝트'
    }
  }

  @state() private projectName: string = ''
  @state() private projectList: Project[] = []
  @state() private projectCount: number = 0

  render() {
    return html`
      <div header>
        <label>프로젝트 이름</label>
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
          return html`
            <div project-container>
              <a href=${`project-detail/${project.id}`}>
                <img
                  ?no-image=${!project.mainPhoto?.fullpath}
                  project-img
                  src=${project.mainPhoto?.fullpath || '/assets/images/no-image.png'}
                />

                <span project-info>
                  <div name>${project.name}</div>
                  <div content>${project.buildingComplex.address}</div>
                  <div content>면적: ${project.buildingComplex?.area?.toLocaleString() || ''}㎡</div>
                  <div content>착공~준공: ${project.startDate} ~ ${project.endDate}</div>
                  <div content>발주처: <strong>${project.buildingComplex.clientCompany}</strong></div>
                </span>

                <span project-state>
                  <div progress>
                    <md-linear-progress buffer="100" max="100" value=${project.totalProgress || 0}> </md-linear-progress>
                    <span>전체</span>
                    <span>${project.totalProgress || 0}%</span>
                  </div>
                  <div>시공사: ${project.buildingComplex.constructionCompany}</div>
                  <div>건설구분: ${project.buildingComplex.constructionType}</div>
                  <div>세대수: ${project.buildingComplex?.householdCount?.toLocaleString() || ''}세대</div>
                  <div>기타: ${project.buildingComplex.etc}</div>
                </span>
              </a>
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
              startDate
              endDate
              mainPhoto {
                fullpath
              }
              totalProgress
              weeklyProgress
              kpi
              inspPassRate
              robotProgressRate
              structuralSafetyRate
              buildingComplex {
                address
                area
                clientCompany
                constructionCompany
                constructionType
                householdCount
                etc
              }
            }
            total
          }
        }
      `,
      variables: {
        filters: [
          {
            name: 'name',
            operator: 'search',
            value: `%${this.projectName}%`
          },
          {
            name: 'state',
            operator: 'eq',
            value: ProjectState.COMPLETED
          }
        ]
      }
    })

    this.projectList = response.data.projects?.items || []
    this.projectCount = response.data.projects?.total || 0
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
