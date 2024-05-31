import '@operato/data-grist'
import { PageView } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'

import gql from 'graphql-tag'
import { Project } from './project-list-page'

@customElement('project-update')
export class ProjectUpdate extends ScopedElementsMixin(PageView) {
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
      title: '프로젝트 정보 관리'
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
                    .value=${this.project?.buildingComplex?.address || ''}
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
                  .value=${this.project?.buildingComplex?.area?.toString() || ''}
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
                  .value=${this.project?.buildingComplex?.clientCompany || ''}
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
                  .value=${this.project?.buildingComplex?.constructionCompany || ''}
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
                  .value=${this.project?.buildingComplex?.designCompany || ''}
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
                  .value=${this.project?.buildingComplex?.supervisoryCompany || ''}
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
                  .value=${this.project?.buildingComplex?.constructionType || ''}
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
                  .value=${this.project?.buildingComplex?.mainPhoto || ''}
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
                  .value=${this.project?.buildingComplex?.constructionCost?.toString() || ''}
                  @input=${this._onInputChange}
              /></span>
            </div>
            <div>
              <span>기타사항</span>
              <span>
                <textarea
                  name="etc"
                  building-complex
                  .value=${this.project?.buildingComplex?.clientCompany || ''}
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
                    .value=${this.project?.buildingComplex?.householdCount?.toString() || ''}
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
                    value=${this.project?.buildingComplex?.buildingCount?.toString() || ''}
                    @input=${this._onInputChange}
                  />
                  <button @click=${this._setBuilding}>적용</button>
                </span>
              </div>
              <div>
                ${this.project?.buildingComplex?.buildings?.map(
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

  async pageInitialized(lifecycle: PageLifecycle) {}

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

    this.project = response.data?.project
  }

  private async _saveProject() {
    const response = await client.mutate({
      mutation: gql`
        mutation UpdateProject($project: ProjectPatch!) {
          updateProject(project: $project) {
            id
          }
        }
      `,
      variables: {
        project: this.project
      }
    })

    if (!response.errors) {
      notify({ message: '저장에 성공하였습니다.' })
    }
  }

  // 동 적용 버튼을 누르면 입력한 수 만큼 해당 단지에 동 데이터 생성
  private _setBuilding() {
    const buildingCount: number = this.project?.buildingComplex?.buildingCount || 0
    const buildingInitData = { name: undefined, floorCount: undefined }

    // 빌딩 데이터가 없으면 빈 배열 넣어줌
    if (!this.project?.buildingComplex?.buildings?.length) {
      this.project.buildingComplex.buildings = []
    }

    if (this.project.buildingComplex.buildings.length >= buildingCount) {
      // 동 수가 더 작게 들어오면 기존 배열을 필요한 크기만큼 잘라내기
      this.project.buildingComplex.buildings = [...this.project.buildingComplex.buildings!.slice(0, buildingCount)]
    } else {
      // 동수가 더 크게 들어오면 기존 배열 + 빈 값을 채움
      const additionalCount = buildingCount - this.project.buildingComplex.buildings.length
      const additionalBuildings = Array.from({ length: additionalCount }, () => ({ ...buildingInitData }))
      this.project.buildingComplex.buildings = [...this.project.buildingComplex.buildings, ...additionalBuildings]
    }
  }

  // 모든 값 초기화 (초기화 버튼은 TODO 이거 없애는게 좋겠음)
  private _reset() {
    this.project = { ...this.defaultProject }
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
      this.project.buildingComplex![target.name] = inputVal
    } else if (target.hasAttribute('building')) {
      this.project.buildingComplex.buildings![idx][target.name] = inputVal
    }
  }
}
