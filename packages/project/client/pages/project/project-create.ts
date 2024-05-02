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
  name: string
  startDate?: string
  endDate?: string
  totalProgress?: number
  weeklyProgress?: number
  kpi?: number
  inspPassRate?: number
  robotProgressRate?: number
  structuralSafetyRate?: number
}
export interface BuildingComplex {
  address: string
  area: number
  constructionCompany: string
  clientCompany: string
  architect: string
  supervisor: string
  mainPhoto?: string
  constructionType: string
  constructionCost?: number
  etc?: string
  householdCount?: number
  buildingCount?: number
}
export interface Building {
  name: string
  floorCount: number
}

@customElement('project-create')
export class ProjectCreatet extends localize(i18next)(ScopedElementsMixin(PageView)) {
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
      title: i18next.t('title.project_create')
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
    supervisor: '',
    architect: '',
    constructionType: ''
  }

  @state() projectId: String | null = null
  @state() pageMode: 'create' | 'update' = 'create'
  @state() project: Project = { ...this.defaultProject }
  @state() buildingComplex: BuildingComplex = { ...this.defaultbuildingComplex }
  @state() buildings: Building[] = []

  render() {
    return html`
      <div main>
        <div header>
          <h2>신규 프로젝트 생성</h2>
          <div button-container>
            <button @click=${this._reset}>초기화</button>
            <button @click=${this._saveProject}>프로젝트 생성</button>
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
                  name="architect"
                  building-complex
                  .value=${this.buildingComplex.architect || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>감리사</span>
              <span
                ><input
                  type="text"
                  name="supervisor"
                  building-complex
                  .value=${this.buildingComplex.supervisor || ''}
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
                  <button>동 적용</button>
                </span>
              </div>
              <div>
                ${this.buildings?.map(
                  building => html`
                    <div>
                      <span>
                        <input
                          type="text"
                          building
                          name="name"
                          .value=${building.name || ''}
                          @input=${this._onInputChange}
                        />
                        동 층수
                      </span>
                      <span
                        ><input
                          type="text"
                          numeric
                          building
                          name="floorCount"
                          .value=${building?.floorCount?.toString() || ''}
                          @input=${this._onInputChange}
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
    this.projectId = lifecycle.resourceId || ''
    this.pageMode = this.projectId ? 'update' : 'create'

    // 업데이트 화면이면 초기 데이터 가져오기
    if (this.pageMode === 'update' && typeof this.projectId === 'string') {
      this.initProject(this.projectId)
    }
  }

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      // do something here when this page just became as active
    }
  }

  async initProject(projectId: string) {
    this.project = {
      name: 'project name 1',
      startDate: '2024-05-01',
      endDate: '2024-05-10',
      totalProgress: 10,
      weeklyProgress: 20,
      kpi: 30,
      inspPassRate: 40,
      robotProgressRate: 50,
      structuralSafetyRate: 60
    }
    this.buildingComplex = {
      address: '단지 주소',
      area: 100,
      constructionCompany: '건설사 이름',
      clientCompany: '발주처 이름',
      architect: '설계사 이름',
      supervisor: '감리사 이름',
      constructionType: '아파트',
      constructionCost: 10000000,
      etc: '기타 사항',
      householdCount: 100,
      buildingCount: 5
    }

    return

    const response = await client.query({
      query: gql`
        query ($projectId: String) {
          responses: project(projectId: $projectId) {
            id
            name
            description
            active
            updater {
              id
              name
            }
            updatedAt
            buildingComplex
            buildings
          }
        }
      `,
      variables: {
        projectId
      }
    })

    this.project = response.data.responses.project
    this.buildingComplex = response.data.responses.buildingComplex
    this.buildings = response.data.responses.buildings
  }

  private async _saveProject() {
    console.log('this.project : ', this.project)
    console.log('this.buildingComplex : ', this.buildingComplex)
    console.log('this.buildings : ', this.buildings)

    const response = await client.mutate({
      mutation: gql`
        mutation CreateProject(
          $project: ProjectPatch!
          $buildingComplex: BuildingComplexPatch!
          $buildings: [BuildingPatch]
        ) {
          response: createProject(project: $project, buildingComplex: $buildingComplex, buildings: $buildings)
        }
      `,
      variables: {
        project: this.project,
        buildingComplex: this.buildingComplex,
        buildings: this.buildings
      }
    })

    if (!response.errors) {
      notify({ message: i18next.t('text.success to save') })
    }
  }

  // 모든 값 초기화 (초기화 버튼은 TODO 이거 없애는게 좋겠음)
  private _reset() {
    console.log('reset')
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
      inputVal = Number(inputVal.replace(/\D/g, ''))
      target.value = inputVal
    }

    if (target.hasAttribute('project')) {
      this.project[target.name] = target.value
    } else if (target.hasAttribute('building-complex')) {
      this.buildingComplex[target.name] = target.value
    } else if (target.hasAttribute('building')) {
      this.buildings[idx][target.name] = target.value
    }
  }
}
