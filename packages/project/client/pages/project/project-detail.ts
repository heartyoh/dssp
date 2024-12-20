import '@material/web/icon/icon.js'
import '@material/web/button/elevated-button.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/button/outlined-button.js'

import { navigate, PageView } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { ScrollbarStyles } from '@operato/styles'

import gql from 'graphql-tag'
import { BUILDING_INSPECTION_STATUS, BuildingInspection, BuildingInspectionStatus, Project } from './project-list'
import _getWeather from '../lib/waether'
import '@operato/chart/ox-progress-circle.js'

export interface InspectionSummary {
  wait: number
  request: number
  pass: number
  fail: number
}

interface Weather {
  rain: number
  temperature: number
  humidity: number
  wind: string
}

@customElement('project-detail')
export class ProjectDetail extends ScopedElementsMixin(PageView) {
  static styles = [
    ScrollbarStyles,
    css`
      :host {
        display: grid;
        grid-template-rows: 55px auto;
        color: #4e5055;

        width: 100%;
        background-color: var(--md-sys-color-background, #f6f6f6);
        overflow-y: auto;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }

      md-outlined-button {
        --md-outlined-button-container-height: 30px;
        --md-outlined-button-trailing-space: var(--spacing-medium, 8px);
        --md-outlined-button-leading-space: var(--spacing-medium, 8px);
        --md-sys-color-outline: rgba(51,51,51,.20);
      }

      *[bold] {
        font-weight: bold;
      }

      div[header] {
        display: flex;
        margin: 0px var(--spacing-large, 12px);

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

          md-elevated-button {
            margin: 0 var(--spacing-small, 4px);

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
          }
        }
      }

      div[body] {
        display: flex;
        margin: var(--spacing-large, 12px);
        margin-top:0;
        gap: var(--spacing-medium, 8px);

        h3 {
          color: #2e79be;
          font-size: 16px;
          margin: 0px;

          a {
            text-decoration: none;
            color: #2e79be;
          }
        }

        & > div {
          display: flex;
          flex: 1;
          gap: var(--spacing-medium, 8px);
          flex-direction: column;

          & > div {
            display: flex;
            flex-direction: column;
            background-color: var(--md-sys-color-on-primary);
            border: 1px solid #cccccc80;
            gap: var(--spacing-medium, 8px);
            padding: var(--spacing-large, 12px);
            border-radius: 5px;
          }

          div[left-top] {
            div[content-1] {
              display: flex;
              align-items: center;
              gap: var(--spacing-medium, 8px);
              font-size: 14px;

              img {
                width: 42%;
                height: auto;
                aspect-ratio: 1920 / 1080;
                border: 1px solid #cccccc80;
              }
              img[no-image] {
                object-fit: contain;
                opacity: 0.5;
              }
            }
            div[content-2] {
              height: 65px;
              overflow-y: auto;
              font-size: 14px;
            }
          }

          div[left-bottom] {
            flex: 1;

            display: flex;
            flex-direction: column;

            [building-complex-img] {
              width: 100%;
              flex: 1;
              aspect-ratio: 2 / 1;
            }

            img {
              opacity: 0.5;
            }

            div[subject] {
              margin-bottom: var(--spacing-small, 4px);
            }

            div[building-container] {
              display: block;

              & > * {
                margin-right: var(--spacing-medium, 8px);
                margin-bottom: var(--spacing-medium, 8px);
              }
              md-outlined-button {
                --md-outlined-button-container-height: 30px;
                --md-outlined-button-trailing-space: var(--spacing-medium, 8px);
                --md-outlined-button-leading-space: var(--spacing-medium, 8px);
                --md-sys-color-outline: rgba(51,51,51,.20);
              }
            }
          }

          div[right-top] {
            div[state] {
              display: grid;
              grid-template-columns: 0.95fr 0.95fr 1.1fr;
              gap: var(--spacing-large, 12px);

              span[progress] {
                max-width: 150px;
                text-align: center;
                display: flex;
                justify-self: center;
                flex-direction: column;
                width: 100%;

                & > div {
                  font-weight: bold;
                  color: #2e79be;
                  font-size: 12px;
                  margin-top: var(--spacing-small, 4px);
                }
                & > div[week] {
                  color: #06b5af;
                }
              }
              span[weather] {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-small, 4px);
                margin-left: var(--spacing-medium, 8px);
                font-size:14px;

                & > div {
                  display: flex;
                  justify-content: space-between;
                  --md-icon-size: 18px;
                  margin-right: var(--spacing-small, 4px);

                  & > span {
                    display: flex;
                    align-item:center;
                    var(--spacing-tiny, 2px);
                  }
                }
              }
            }
            div[inspection] {
              display: grid;
              grid-template-columns: 1.4fr 0.9fr 0.9fr 0.9fr 0.9fr;
              margin-top: var(--spacing-small, 4px);
              background: #f6f6f6;
              border-radius: 7px;
              padding: var(--spacing-small, 4px) 0px;

              & > span {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                div[wait] {
                  color: #4e5055;
                }
                div[request] {
                  color: #2e79be;
                }
                div[pass] {
                  color: #1bb401;
                }
                div[fail] {
                  color: #ff4444;
                }
              }
              & > span[name] {
                flex-direction: row;
                text-align: right;
                gap: var(--spacing-medium, 8px);
                line-height:1.3;

                md-icon {
                  width: 40px;
                  height: 40px;
                  border-radius: 7px;
                  color: #fff;
                  background: #f16154;
                }
              }
            }
            div[notice] {
              margin-top: var(--spacing-medium, 8px);

              div[name] {
                margin-left: 4px;
              }
              div[content] {
                background-color: #ebc8321a;
                border-radius: 10px;
                padding: var(--spacing-medium, 8px);
                font-size: 14px;
                margin-top: var(--spacing-small, 4px);
              }
            }
          }

          div[right-bottom] {
            flex: 1;

            display: flex;
            flex-direction: column;

            div[table-container] {
              flex: 1;

              overflow-y: auto;
              overflow-x: hidden;
              position: relative;
            }

            hr {
              position: sticky;
              margin: 0;
              top: 0px;
              border: 1px solid #3295f1;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }

            thead {
              position: sticky;
              top: var(--spacing-tiny, 2px);
              background-color: #464651;
              color: var(--md-sys-color-on-primary);
              z-index: 1;
            }

            thead th {
              padding: var(--spacing-tiny, 2px) var(--spacing-small, 4px);
              font-size: 15px;
              text-wrap: pretty;
            }

            tbody td {
              border-bottom: 1px solid rgba(51,51,51,.20);
              padding: var(--spacing-small, 4px);
              text-align: center;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              font-size: 13px;
            }

            md-elevated-button {
              margin: 0 var(--spacing-small, 4px);

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

              &[red] {
                --md-elevated-button-container-color: #e15757;
              }
            }
          }
        }
      }
    `
  ]

  get context() {
    return {
      title: '진행 중 프로젝트 상세 정보'
    }
  }

  private defaultProject = {
    name: '',
    buildingComplex: {
      address: '',
      area: 0,
      constructionCompany: '',
      clientCompany: '',
      supervisoryCompany: '',
      designCompany: '',
      constructionType: '',
      buildings: []
    }
  }

  @state() projectId: string = ''
  @state() project: Project = { ...this.defaultProject }
  @state() buildingInspections: BuildingInspection[] = []
  @state() inspectionSummary: InspectionSummary = {
    wait: 0,
    request: 0,
    pass: 0,
    fail: 0
  }
  @state() weather: Weather = {
    rain: 0,
    temperature: 0,
    humidity: 0,
    wind: ''
  }

  render() {
    return html`
      <div header>
        <h2>${this.project.name}</h2>
        <div button-container>
          <md-elevated-button href=${`project-update/${this.project.id}`}>
            <md-icon slot="icon">assignment</md-icon>프로젝트 정보 수정
          </md-elevated-button>
          <md-elevated-button href=${`project-plan-management/${this.project.id}`}>
            <md-icon slot="icon">description</md-icon>도면 관리
          </md-elevated-button>
          <md-elevated-button href=${`project-schedule/${this.project.id}`}>
            <md-icon slot="icon">event_note</md-icon>공정표 관리
          </md-elevated-button>
        </div>
      </div>

      <div body>
        <div>
          <div left-top>
            <h3>기본 정보</h3>
            <div content-1>
              <img
                ?no-image=${!this.project.mainPhoto?.fullpath}
                src=${this.project.mainPhoto?.fullpath || '/assets/images/no-image.png'}
              />

              <div>
                <div row>
                  <span>- 면적 : </span>
                  <span>${this.project.buildingComplex?.area?.toLocaleString()} ㎡</span>
                </div>
                <div row>
                  <span>- 착공~준공 : </span>
                  <span bold>${this.project.startDate}~${this.project.endDate}</span>
                </div>
                <div row>
                  <span>- 발주처 : </span>
                  <span>${this.project.buildingComplex?.clientCompany}</span>
                </div>
                <div row>
                  <span>- 건설사 : </span>
                  <span>${this.project.buildingComplex?.constructionCompany}</span>
                </div>
                <div row>
                  <span>- 감리사 : </span>
                  <span>${this.project.buildingComplex?.supervisoryCompany}</span>
                </div>
                <div row>
                  <span>- 설계사 : </span>
                  <span>${this.project.buildingComplex?.designCompany}</span>
                </div>
              </div>
            </div>

            <div content-2>
              <div row>
                <span>- 건설구분 : </span>
                <span>${this.project.buildingComplex?.constructionType}</span>
              </div>
              <div row>
                <span>- 공사금액 : </span>
                <span>${this.project.buildingComplex?.constructionCost?.toLocaleString()} 원</span>
              </div>
              <div row>
                <span>- 세대수 : </span>
                <span>${this.project.buildingComplex?.householdCount?.toLocaleString()}</span>
              </div>
              <div row>
                <span>- 기타 : </span>
                <span>${this.project.buildingComplex?.etc}</span>
              </div>
            </div>
          </div>

          <div left-bottom>
            <h3>조감도(BIM도면)</h3>
            ${this.project.buildingComplex?.drawing?.fullpath
              ? html`<div building-complex-img></div>`
              : html`<img building-complex-img src="/assets/images/img-building-complex-default.jpg" />`}
            <div>
              <div subject bold>개별 단지 상세정보 바로가기</div>
              <div building-container>
                ${this.project.buildingComplex?.buildings?.map(building => {
                  return html`<md-outlined-button href=${`building-complex-detail/${this.project.id}?buildingId=${building.id}`}>
                    ${building.name}
                  </md-outlined-button>`
                })}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div right-top>
            <h3>프로젝트 현황</h3>
            <div state>
              <span progress>
                <ox-progress-circle
                  .value=${this.project.totalProgress}
                  titleText="전체"
                  suffix="%"
                  fontSize="27px"
                  fontColor="#4E5055"
                  borderStyle="none"
                  innerCircleSize="28%"
                  circleColor="#0595E5"
                  shadow="#00000026 4px 4px 4px"
                  background="#eaf5fd"
                ></ox-progress-circle>
                <div>전체공정율(%)</div>
              </span>
              <span progress>
                <ox-progress-circle
                  .value=${this.project.weeklyProgress}
                  titleText="주간"
                  suffix="%"
                  fontSize="27px"
                  fontColor="#4E5055"
                  borderStyle="none"
                  innerCircleSize="28%"
                  circleColor="#06B5AF"
                  shadow="#00000026 4px 4px 4px"
                  background="#eaf7f7"
                ></ox-progress-circle>
                <div week>주간공정율(%)</div>
              </span>
              <span weather>
                <div bold>현장현황</div>
                <div>
                  <span><md-icon slot="icon">rainy</md-icon>강수확률</span>
                  <span bold>${this.weather.rain}%</span>
                </div>
                <div>
                  <span><md-icon slot="icon">humidity_percentage</md-icon> 습도</span>
                  <span bold>${this.weather.humidity}%</span>
                </div>
                <div>
                  <span><md-icon slot="icon">thermostat</md-icon> 온도</span>
                  <span bold>${this.weather.temperature}°C</span>
                </div>
                <div>
                  <span><md-icon slot="icon">air</md-icon> 풍향</span>
                  <span bold>${this.weather.wind}</span>
                </div>
              </span>
            </div>
            <div inspection>
              <span name bold>
                <md-icon slot="icon">list_alt_add</md-icon>
                시공검측<br />현황
              </span>
              <span>
                <div>검측요청</div>
                <div bold>${this.inspectionSummary.wait}</div>
              </span>
              <span>
                <div>검측대기</div>
                <div bold>${this.inspectionSummary.request}</div>
              </span>
              <span>
                <div>합격</div>
                <div bold pass>${this.inspectionSummary.pass}</div>
              </span>
              <span>
                <div>불합격</div>
                <div bold fail>${this.inspectionSummary.fail}</div>
              </span>
            </div>
            <div notice>
              <div name bold>공지사항</div>
              <div content>${this.project.buildingComplex.notice}</div>
            </div>
          </div>

          <div right-bottom>
            <h3>검측 현황</h3>
            <div table-container>
              <hr />
              <table>
                <thead>
                  <tr>
                    <th width="3%"></th>
                    <th width="10%">검측 위치</th>
                    <th width="10%">공종</th>
                    <th width="22%">내용</th>
                    <th width="15%">검측 요청일</th>
                    <th width="10%">검측 결과</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.buildingInspections.map((inspection, idx) => {
                    return html` <tr @click=${() => this._onClickInspection(inspection.id || '')}>
                      <td>${idx + 1}</td>
                      <td>${inspection?.buildingLevel?.building?.name} ${inspection?.buildingLevel?.floor}층</td>
                      <td bold>${inspection.checklist?.constructionType}</td>
                      <td>${inspection.checklist?.inspectionParts?.join(', ') || ''}</td>
                      <td>${this._formatDate(inspection.requestDate)}</td>
                      <td bold>${inspection.status && BUILDING_INSPECTION_STATUS[inspection.status]}</td>
                    </tr>`
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `
  }

  async pageInitialized(lifecycle: PageLifecycle) {}

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      this.projectId = lifecycle.resourceId || ''
      await this.initProject(lifecycle.resourceId)
    }
  }

  async initProject(projectId: string = '') {
    const response = await client.query({
      query: gql`
        query Project($id: String!, $projectId: String!, $params: BuildingInspectionsOfProject!) {
          project(id: $id) {
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
              id
              address
              latitude
              longitude
              area
              clientCompany
              constructionCompany
              supervisoryCompany
              designCompany
              drawing {
                id
                name
                fullpath
              }
              constructionType
              constructionCost
              etc
              notice
              householdCount
              buildingCount
              buildings {
                id
                name
                floorCount
              }
            }
          }

          inspectionSummary: buildingInspectionSummaryOfProject(projectId: $projectId) {
            wait
            request
            pass
            fail
          }

          buildingInspectionsOfProject(params: $params) {
            items {
              id
              status
              requestDate
              buildingLevel {
                floor
                building {
                  name
                }
              }
              checklist {
                name
                constructionType
                constructionDetailType
                inspectionParts
              }
            }
            total
          }
        }
      `,
      variables: {
        id: projectId,
        projectId,
        params: {
          projectId,
          limit: 10
        }
      }
    })

    if (response.errors) return

    this.project = response.data?.project || {}
    this.inspectionSummary = response.data?.inspectionSummary || {}
    this.buildingInspections = response.data?.buildingInspectionsOfProject?.items || []

    const { latitude, longitude } = this.project?.buildingComplex
    if (latitude && longitude) {
      this.weather = await _getWeather(latitude, longitude)
    }
  }

  private _onClickInspection(buildingInspectionId: string) {
    navigate(`building-inspection-detail-drawing/${buildingInspectionId}`)
  }

  private _formatDate(date: Date | undefined) {
    return date
      ? new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(date))
      : ''
  }
}
