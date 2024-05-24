import '@operato/data-grist'

import { CommonButtonStyles, CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageView, store } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { ColumnConfig, DataGrist, FetchOption, SortersControl } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { i18next, localize } from '@operato/i18n'
import { notify, openPopup } from '@operato/layout'
import { OxPopup, OxPrompt } from '@operato/popup'
import { isMobileDevice } from '@operato/utils'

import gql from 'graphql-tag'

export enum ProjectStatus {
  'PROCEEDING' = '10',
  'COMPLICATED' = '20'
}

export interface Project {
  id?: string
  name: string
  startDate?: string
  endDate?: string
  totalProgress?: number
  weeklyProgress?: number
  kpi?: number
  inspPassRate?: number
  robotProgressRate?: number
  structuralSafetyRate?: number
  buildingComplex?: BuildingComplex
}
export interface BuildingComplex {
  id?: string
  address: string
  area: number
  constructionCompany: string
  clientCompany: string
  designCompany: string
  supervisoryCompany: string
  mainPhoto?: string
  constructionType: string
  constructionCost?: number
  etc?: string
  householdCount?: number
  buildingCount?: number
  buildings?: Building[]
}
export interface Building {
  id?: string
  name: string | undefined
  floorCount: number | undefined
}

@customElement('project-update')
export class ProjectUpdate extends localize(i18next)(ScopedElementsMixin(PageView)) {
  static styles = [
    css`
      :host {
        display: flex;

        width: 100%;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }

      div[body] {
        display: flex;
      }
    `
  ]

  get context() {
    return {
      title: i18next.t('title.project_update')
    }
  }

  private defaultProject = {
    name: ''
  }
  private defaultbuildingComplex = {
    address: '',
    area: 0,
    constructionCompany: '',
    clientCompany: '',
    supervisoryCompany: '',
    designCompany: '',
    constructionType: ''
  }

  @state() projectId: string = ''
  @state() project: Project = { ...this.defaultProject }
  @state() buildingComplex: BuildingComplex = { ...this.defaultbuildingComplex }
  @state() buildings: Building[] = []

  render() {
    return html`
      <div main>
        <div header>
          <h2>프로젝트 정보 관리</h2>
          <div button-container>
            <button @click=${this._reset}>초기화</button>
            <button @click=${this._saveProject}>정보 저장</button>
            <button>검측현황 관리</button>
            <button>공정표 관리</button>
          </div>
        </div>
        <div body>
          <div project-info>
            <h3>기본 정보</h3>
            <div>
              <span>프로젝트명</span>
              <span
                ><input
                  type="text"
                  name="name"
                  project
                  .value=${this.project.name || ''}
                  @input=${this._onInputChange}
                />
              </span>
            </div>
            <div>
              <span>프로젝트 주소</span>
              <span>
                <div>
                  <input
                    type="text"
                    name="address"
                    building-complex
                    .value=${this.buildingComplex.address || ''}
                    @input=${this._onInputChange}
                  />
                </div>
              </span>
            </div>
            <div>
              <span>면적</span>
              <span
                ><input
                  type="text"
                  name="area"
                  numeric
                  building-complex
                  .value=${this.buildingComplex.area?.toString() || ''}
                  @input=${this._onInputChange}
                />
                ㎡</span
              >
            </div>
            <div>
              <span>착공일정 ~ 준공일정</span>
              <span
                ><input
                  type="date"
                  name="startDate"
                  project
                  .value=${this.project.startDate || ''}
                  @input=${this._onInputChange} />
                ~
                <input
                  type="date"
                  name="endDate"
                  project
                  .value=${this.project.endDate || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>발주처</span>
              <span
                ><input
                  type="text"
                  name="clientCompany"
                  building-complex
                  .value=${this.buildingComplex.clientCompany || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>건설사</span>
              <span
                ><input
                  type="text"
                  name="constructionCompany"
                  building-complex
                  .value=${this.buildingComplex.constructionCompany || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>설계사</span>
              <span
                ><input
                  type="text"
                  name="designCompany"
                  building-complex
                  .value=${this.buildingComplex.designCompany || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>감리사</span>
              <span
                ><input
                  type="text"
                  name="supervisoryCompany"
                  building-complex
                  .value=${this.buildingComplex.supervisoryCompany || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>건설구분</span>
              <span
                ><input
                  type="text"
                  name="constructionType"
                  building-complex
                  .value=${this.buildingComplex.constructionType || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>대표사진 업로드</span>
              <span
                ><input
                  type="file"
                  name="mainPhoto"
                  building-complex
                  .value=${this.buildingComplex.mainPhoto || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>공사금액</span>
              <span
                ><input
                  type="text"
                  name="constructionCost"
                  numeric
                  building-complex
                  .value=${this.buildingComplex.constructionCost?.toString() || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>기타사항</span>
              <span>
                <textarea
                  name="etc"
                  building-complex
                  .value=${this.buildingComplex.clientCompany || ''}
                  @input=${this._onInputChange}
                ></textarea>
              </span>
            </div>
          </div>
          <div detail-info>
            <div>
              <h3>건설구분 상세 정보</h3>
              <div>
                <span>세대수</span>
                <span
                  ><input
                    type="text"
                    numeric
                    building-complex
                    name="householdCount"
                    .value=${this.buildingComplex.householdCount?.toString() || ''}
                    @input=${this._onInputChange}
                  />
                </span>
              </div>
              <div>
                <span>동수</span>
                <span
                  ><input
                    type="text"
                    numeric
                    building-complex
                    name="buildingCount"
                    value=${this.buildingComplex.buildingCount?.toString() || ''}
                    @input=${this._onInputChange}
                  />
                  <button @click=${this._setBuilding}>적용</button>
                </span>
              </div>
              <div>
                ${this.buildings?.map(
                  (building, idx) => html`
                    <div>
                      <span>
                        <input
                          type="text"
                          building
                          name="name"
                          .value=${building?.name || ''}
                          @input=${e => this._onInputChange(e, idx)}
                          placeholder="ooo동"
                        />
                        층수
                      </span>
                      <span
                        ><input
                          type="text"
                          numeric
                          building
                          name="floorCount"
                          .value=${building?.floorCount?.toString() || ''}
                          @input=${e => this._onInputChange(e, idx)}
                          placeholder="oo"
                      /></span>
                    </div>
                  `
                )}
              </div>
            </div>

            <div>
              <h3>프로젝트 현황</h3>
              <div>
                <div>
                  <span>전체 진행현황</span> 주간 진행현황 KPI
                  <span
                    ><input
                      type="text"
                      numeric
                      project
                      name="totalProgress"
                      .value=${this.project.totalProgress?.toString() || ''}
                      @input=${this._onInputChange}
                    />
                  </span>
                </div>
                <div>
                  <span>검측/통과비율</span> 로봇작업진행율 구조안전도
                  <span
                    ><input
                      type="text"
                      numeric
                      project
                      name="inspPassRate"
                      .value=${this.project.inspPassRate?.toString() || ''}
                      @input=${this._onInputChange}
                    />
                  </span>
                </div>
              </div>
              <div>
                <div>
                  <span>주간 진행현황</span>
                  <span
                    ><input
                      type="text"
                      numeric
                      project
                      name="weeklyProgress"
                      .value=${this.project.weeklyProgress?.toString() || ''}
                      @input=${this._onInputChange}
                    />
                  </span>
                </div>
                <div>
                  <span>로봇작업진행율</span>
                  <span
                    ><input
                      type="text"
                      numeric
                      project
                      name="robotProgressRate"
                      .value=${this.project.robotProgressRate?.toString() || ''}
                      @input=${this._onInputChange}
                    />
                  </span>
                </div>
              </div>
              <div>
                <div>
                  <span>KPI</span>
                  <span
                    ><input
                      type="text"
                      numeric
                      project
                      name="kpi"
                      .value=${this.project.kpi?.toString() || ''}
                      @input=${this._onInputChange}
                    />
                  </span>
                </div>
                <div>
                  <span>구조안전도</span>
                  <span
                    ><input
                      type="text"
                      numeric
                      project
                      name="structuralSafetyRate"
                      .value=${this.project.structuralSafetyRate?.toString() || ''}
                      @input=${this._onInputChange}
                    />
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3>공지사항</h3>
              <div>
                <span></span>
                <span>
                  <textarea></textarea>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  async pageInitialized(lifecycle: PageLifecycle) {
    // this.projectId = lifecycle.resourceId || ''
    // await this.initProject(this.projectId)
  }

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      this.projectId = lifecycle.resourceId || ''
      await this.initProject(this.projectId)
    }
  }

  async initProject(projectId: string = '') {
    const response = await client.query({
      query: gql`
        query Project($id: String!) {
          project(id: $id) {
            id
            name
            startDate
            endDate
            totalProgress
            weeklyProgress
            kpi
            inspPassRate
            robotProgressRate
            structuralSafetyRate
            buildingComplex {
              id
              address
              area
              clientCompany
              constructionCompany
              supervisoryCompany
              designCompany
              mainPhoto
              constructionType
              constructionCost
              etc
              householdCount
              buildingCount
              buildings {
                id
                name
                floorCount
              }
            }
          }
        }
      `,
      variables: {
        id: projectId
      }
    })

    console.log('initProject : ', response.data?.project)

    this.project = { ...(response.data?.project || {}) }
    this.buildingComplex = { ...(response.data.project?.buildingComplex || {}) }
    this.buildings = [...(response.data.project?.buildingComplex?.buildings || [])]

    delete this.project.buildingComplex
    delete this.buildingComplex?.buildings
  }

  private async _saveProject() {
    console.log('this.project : ', this.project)
    console.log('this.buildingComplex : ', this.buildingComplex)
    console.log('this.buildings : ', this.buildings)

    const response = await client.mutate({
      mutation: gql`
        mutation UpdateProject(
          $project: ProjectPatch!
          $buildingComplex: BuildingComplexPatch!
          $buildings: [BuildingPatch!]!
        ) {
          updateProject(buildings: $buildings, buildingComplex: $buildingComplex, project: $project) {
            id
          }
        }
      `,
      variables: {
        project: this.project,
        buildingComplex: this.buildingComplex,
        buildings: this.buildings
      }
    })

    if (!response.errors) {
      notify({ message: '저장에 성공하였습니다.' })
    }
  }

  // 동 적용 버튼을 누르면 입력한 수 만큼 해당 단지에 동 데이터 생성
  private _setBuilding() {
    const buildingCount: number = this.buildingComplex.buildingCount || 0
    // this.buildings = Array(buildingCount).fill({ name: undefined, floorCount: undefined })
    const buildingInitData = { name: undefined, floorCount: undefined }

    if (this.buildings.length >= buildingCount) {
      // 동 수가 더 작게 들어오면 기존 배열을 필요한 크기만큼 잘라내기
      this.buildings = [...this.buildings.slice(0, buildingCount)]
    } else {
      // 동수가 더 크게 들어오면 기존 배열 + 빈 값을 채움
      const additionalCount = buildingCount - this.buildings.length
      const additionalBuildings = Array.from({ length: additionalCount }, () => ({ ...buildingInitData }))
      this.buildings = [...this.buildings, ...additionalBuildings]
    }
  }

  // 모든 값 초기화 (초기화 버튼은 TODO 이거 없애는게 좋겠음)
  private _reset() {
    this.project = { ...this.defaultProject }
    this.buildingComplex = { ...this.defaultbuildingComplex }
    this.buildings = []
  }

  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent, idx: number) {
    const target = event.target as HTMLInputElement
    let inputVal: any = target.value

    // 숫자 타입은 다른 문자 입력 제거
    if (target.hasAttribute('numeric')) {
      inputVal = Number(inputVal.replace(/\D./g, ''))
    }

    if (target.hasAttribute('project')) {
      this.project[target.name] = inputVal
    } else if (target.hasAttribute('building-complex')) {
      this.buildingComplex[target.name] = inputVal
    } else if (target.hasAttribute('building')) {
      this.buildings[idx][target.name] = inputVal
    }
  }
}
