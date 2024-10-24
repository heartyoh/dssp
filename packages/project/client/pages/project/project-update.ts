import '@material/web/icon/icon.js'
import '@material/web/button/elevated-button.js'
import '@material/web/textfield/outlined-text-field.js'

import { PageView } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'
import { Project } from './project-list'
import '../lib/select2-component'
import './component/project-update-header'

@customElement('project-update')
export class ProjectUpdate extends ScopedElementsMixin(PageView) {
  static styles = [
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

      md-outlined-text-field {
        width: 100%;

        --md-outlined-text-field-container-shape: 5px;
        --md-outlined-text-field-outline-color: rgba(51,51,51,.20);
        --md-outlined-text-field-focus-outline-color: #1f7fd9;
        --md-outlined-text-field-focus-outline-width: 1px;
        --md-sys-color-primary: #586878;
        --md-outlined-text-field-input-text-size: 14px;
        --md-outlined-field-bottom-space: 3px;
        --md-outlined-field-top-space: 3px;
        --md-outlined-field-leading-space: var(--spacing-medium, 8px);
        --md-outlined-field-trailing-space: var(--spacing-medium, 8px);
      }
      select2-component {
        width:100%;
      }
      input[type="date"] {
        border:1px solid rgba(51,51,51,.20);
        padding:var(--spacing-small, 4px) var(--spacing-medium, 8px);
        border-radius: 5px;
      }
      md-outlined-text-field[type='textarea'] {
        width: 100%;
        height: 120px;
        resize: none;
      }

      ox-input-image {
        width: 120px;
        height: 90px;
      }
      ox-input-file {
        width: 120px;
        height: 90px;
        padding: 0;
      }

      div[body] {
        display: flex;
        margin: var(--spacing-large, 12px);
        margin-top:0;
        gap: var(--spacing-medium, 8px);

        & > div {
          display: flex;
          height: fit-content;
          flex-direction: column;
          padding: var(--spacing-large, 12px);
          background-color: var(--md-sys-color-on-primary);
          border: 1px solid #cccccc80;
          border-radius: 5px;
          gap: var(--spacing-medium, 8px);

          h3 {
            color: #2e79be;
            font-size: 16px;
            margin: 0px;
          }

          div[row] {
            display: flex;
            align-items: center;

            span:first-child {
              flex: 0.3;
              text-align: right;
              font-size: 14px;
            }

            span:last-child {
              flex: 0.7;
              display: flex;
              gap: var(--spacing-medium, 8px);
              margin-left: var(--spacing-medium, 8px);
              align-items: center;

              &[align-end] {
                align-items: end;
              }
            }
          }
        }

        div[project-info] {
          flex: 0.55;
        }

        div[detail-info] {
          flex: 0.45;
          padding: 0px;
          gap: 10px;
          background-color: transparent;
          border: none;

          & > div {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-medium, 8px);
            border: 1px solid #cccccc80;
            border-radius: 5px;
            padding: var(--spacing-large, 12px);
            background-color: var(--md-sys-color-on-primary);

            md-outlined-text-field[type='text'] {
              width: 60%;
            }

            md-elevated-button {
              --md-elevated-button-container-height: 30px;
              --md-elevated-button-container-color: var(--md-sys-color-on-primary);
              --md-elevated-button-label-text-size: 16px;
            }
            hr {
              border: 1px rgba(51,51,51,.1) dashed;
              width: 100%;
              margin-bottom: var(--spacing-tiny, 2px);
            }
            div[warn] {
              font-size: 12px;
              color: red;
              margin-left: var(--spacing-small, 4px);
              margin-bottom: var(--spacing-small, 4px);
            }
            
            md-outlined-button {
              min-height: 30px;
              padding: 0 var(--spacing-large, 12px);
              box-shadow: 1px 1px 1px #0000001a;
              --md-outlined-button-label-text-color: #586878;
              --md-outlined-button-label-text-weight: bold;
              --md-sys-color-outline: rgba(51,51,51,.20);
            }

            div[row] {
              span:first-child {
                flex: 0.2;
              }
              span:last-child {
                flex: 0.8;
              }
            }

            div[separate-container] {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: var(--spacing-medium, 8px);

              md-outlined-text-field {
                width: 70px;
              }

              & > div {
                display: flex;

                span[floor-title] {
                  min-width: 33px;
                  margin-right: var(--spacing-small, 4px);
                }
                span:first-child {
                  flex: 0.4;
                  justify-content: end;
                  display: flex;
                }
                span:last-child {
                  flex: 0.6;
                  display: flex;
                  align-items: center;
                  padding-left: var(--spacing-medium, 8px);
                }
              }
            }

            &[project] {
              div[separate-container] {
                & > div {
                  span:first-child {
                    flex: 0.6;
                    min-width: 100px;
                  }
                  span:last-child {
                    flex: 0.4;
                    margin-left: 0;
                  }
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
  @state() selectedValues: string[] = []
  @state() overallConstructorList: Array<{ name: string; value: string }> = []
  @state() taskConstructorList: Array<{ name: string; value: string }> = []
  @state() taskSupervisoryList: Array<{ name: string; value: string }> = []
  @state() overallSupervisoryList: Array<{ name: string; value: string }> = []

  render() {
    return html`
      <project-update-header .projectId=${this.project.id || ''} title="프로젝트 정보 관리" @custom-click=${this._saveProject}>
      </project-update-header>

      <div body>
        <div project-info>
          <h3>기본 정보</h3>
          <div row>
            <span>프로젝트명</span>
            <span
              ><md-outlined-text-field
                type="text"
                name="name"
                project
                .value=${this.project.name || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>프로젝트 주소</span>
            <span>
              <md-outlined-text-field
                type="text"
                name="address"
                building-complex
                .value=${this.project?.buildingComplex?.address || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>위도</span>
            <span>
              <md-outlined-text-field
                type="text"
                name="latitude"
                numeric
                building-complex
                .value=${this.project?.buildingComplex?.latitude?.toString() || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>경도</span>
            <span>
              <md-outlined-text-field
                type="text"
                name="longitude"
                numeric
                building-complex
                .value=${this.project?.buildingComplex?.longitude?.toString() || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>면적</span>
            <span align-end
              ><md-outlined-text-field
                type="text"
                name="area"
                numeric
                building-complex
                .value=${this.project?.buildingComplex?.area?.toString() || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
              ㎡</span
            >
          </div>
          <div row>
            <span>착공일정 ~ 준공일정</span>
            <span
              ><input
                type="date"
                name="startDate"
                project
                .value=${this.project.startDate || ''}
                @input=${this._onInputChange}
                max="9999-12-31"
              />
              ~
              <input
                type="date"
                name="endDate"
                project
                .value=${this.project.endDate || ''}
                @input=${this._onInputChange}
                max="9999-12-31"
              />
            </span>
          </div>
          <div row>
            <span>발주처</span>
            <span
              ><md-outlined-text-field
                type="text"
                name="clientCompany"
                building-complex
                .value=${this.project?.buildingComplex?.clientCompany || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>건설사</span>
            <span
              ><md-outlined-text-field
                type="text"
                name="constructionCompany"
                building-complex
                .value=${this.project?.buildingComplex?.constructionCompany || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>설계사</span>
            <span
              ><md-outlined-text-field
                type="text"
                name="designCompany"
                building-complex
                .value=${this.project?.buildingComplex?.designCompany || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>감리사</span>
            <span
              ><md-outlined-text-field
                type="text"
                name="supervisoryCompany"
                building-complex
                .value=${this.project?.buildingComplex?.supervisoryCompany || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>건설구분</span>
            <span
              ><md-outlined-text-field
                type="text"
                name="constructionType"
                building-complex
                .value=${this.project?.buildingComplex?.constructionType || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>대표사진 업로드</span>
            <span>
              <ox-input-image
                name="mainPhoto"
                value=${this.project?.mainPhoto?.fullpath || ''}
                @change=${this.onCreateAttachment.bind(this)}
              ></ox-input-image>
            </span>
          </div>
          <div row>
            <span>단지 BIM</span>
            <span>
              <ox-input-file
                name="drawing"
                label=" "
                description="IFC 업로드"
                .value=${this.project?.buildingComplex?.drawing || ''}
                @change=${this.onCreateAttachment.bind(this)}
              ></ox-input-file>
            </span>
          </div>
          <div row>
            <span>공사금액</span>
            <span
              ><md-outlined-text-field
                type="text"
                name="constructionCost"
                numeric
                building-complex
                .value=${this.project?.buildingComplex?.constructionCost?.toString() || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>기타사항</span>
            <span>
              <md-outlined-text-field
                type="textarea"
                name="etc"
                building-complex
                .value=${this.project?.buildingComplex?.etc || ''}
                @input=${this._onInputChange}
              ></md-outlined-text-field>
            </span>
          </div>
          <div row>
            <span>총괄 시공 관리자 리스트</span>
            <span>
              <select2-component
                placeholder="총괄 시공 관리자 리스트"
                name="overallConstructorEmails"
                .options=${this.overallConstructorList}
                .selectedValues=${this.project?.buildingComplex?.overallConstructorEmails || []}
                @selection-changed=${this._handleSelectionChange}
              ></select2-component>
            </span>
          </div>
          <div row>
            <span>공종별 시공 관리자 리스트</span>
            <span>
              <select2-component
                placeholder="공종별 시공 관리자 리스트"
                name="taskConstructorEmails"
                .options=${this.taskConstructorList}
                .selectedValues=${this.project?.buildingComplex?.taskConstructorEmails || []}
                @selection-changed=${this._handleSelectionChange}
              ></select2-component>
            </span>
          </div>
          <div row>
            <span>총괄 감리 책임자 리스트</span>
            <span>
              <select2-component
                placeholder="총괄 감리 책임자 리스트"
                name="overallSupervisoryEmails"
                .options=${this.overallSupervisoryList}
                .selectedValues=${this.project?.buildingComplex?.overallSupervisoryEmails || []}
                @selection-changed=${this._handleSelectionChange}
              ></select2-component>
            </span>
          </div>
          <div row>
            <span>공종별 감리 책임자 리스트</span>
            <span>
              <select2-component
                placeholder="공종별 감리 책임자 리스트"
                name="taskSupervisoryEmails"
                .options=${this.taskSupervisoryList}
                .selectedValues=${this.project?.buildingComplex?.taskSupervisoryEmails || []}
                @selection-changed=${this._handleSelectionChange}
              ></select2-component
            ></span>
          </div>
        </div>

        <div detail-info>
          <div>
            <h3>건설구분 상세 정보</h3>
            <div row>
              <span>세대수</span>
              <span
                ><md-outlined-text-field
                  type="text"
                  numeric
                  building-complex
                  name="householdCount"
                  .value=${this.project?.buildingComplex?.householdCount?.toString() || ''}
                  @input=${this._onInputChange}
                ></md-outlined-text-field>
              </span>
            </div>
            <div row>
              <span>동수</span>
              <span
                ><md-outlined-text-field
                  type="text"
                  numeric
                  building-complex
                  name="buildingCount"
                  value=${this.project?.buildingComplex?.buildingCount?.toString() || ''}
                  @input=${this._onInputChange}
                ></md-outlined-text-field>
                <md-outlined-button @click=${this._setBuilding}>적용</md-outlined-button>
              </span>
            </div>
            <hr />
            <div warn>* 동/층의 정보를 수정하면 기존의 동/층 정보는 모두 제거됩니다.</div>
            <div separate-container>
              ${this.project?.buildingComplex?.buildings?.map(
                (building, idx) => html`
                  <div>
                    <span>
                      <md-outlined-text-field
                        type="text"
                        building
                        name="name"
                        .value=${building?.name || ''}
                        @input=${e => this._onInputChange(e, idx)}
                        placeholder="ooo동"
                      ></md-outlined-text-field>
                    </span>
                    <span>
                      <span floor-title>층수</span>
                      <md-outlined-text-field
                        type="text"
                        numeric
                        building
                        name="floorCount"
                        .value=${building?.floorCount?.toString() || ''}
                        @input=${e => this._onInputChange(e, idx)}
                        placeholder="oo"
                      ></md-outlined-text-field>
                    </span>
                  </div>
                `
              )}
            </div>
          </div>

          <div project>
            <h3>프로젝트 현황</h3>
            <div row separate-container>
              <div>
                <span>전체 진행현황</span>
                <span>
                  <md-outlined-text-field
                    type="text"
                    numeric
                    project
                    name="totalProgress"
                    .value=${this.project.totalProgress?.toString() || ''}
                    @input=${this._onInputChange}
                    suffix-text="%"
                  ></md-outlined-text-field>
                </span>
              </div>
              <div>
                <span>검측/통과비율</span>
                <span>
                  <md-outlined-text-field
                    type="text"
                    numeric
                    project
                    name="inspPassRate"
                    .value=${this.project.inspPassRate?.toString() || ''}
                    @input=${this._onInputChange}
                    suffix-text="%"
                  ></md-outlined-text-field>
                </span>
              </div>
            </div>
            <div row separate-container>
              <div>
                <span>주간 진행현황</span>
                <span>
                  <md-outlined-text-field
                    type="text"
                    numeric
                    project
                    name="weeklyProgress"
                    .value=${this.project.weeklyProgress?.toString() || ''}
                    @input=${this._onInputChange}
                    suffix-text="%"
                  ></md-outlined-text-field>
                </span>
              </div>
              <div>
                <span>로봇작업진행율</span>
                <span>
                  <md-outlined-text-field
                    type="text"
                    numeric
                    project
                    name="robotProgressRate"
                    .value=${this.project.robotProgressRate?.toString() || ''}
                    @input=${this._onInputChange}
                    suffix-text="%"
                  ></md-outlined-text-field>
                </span>
              </div>
            </div>
            <div row separate-container>
              <div>
                <span>KPI</span>
                <span
                  ><md-outlined-text-field
                    type="text"
                    numeric
                    project
                    name="kpi"
                    .value=${this.project.kpi?.toString() || ''}
                    @input=${this._onInputChange}
                    suffix-text="%"
                  ></md-outlined-text-field>
                </span>
              </div>
              <div>
                <span>구조안전도</span>
                <span
                  ><md-outlined-text-field
                    type="text"
                    numeric
                    project
                    name="structuralSafetyRate"
                    .value=${this.project.structuralSafetyRate?.toString() || ''}
                    @input=${this._onInputChange}
                    suffix-text="%"
                  ></md-outlined-text-field>
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3>공지사항</h3>
            <div>
              <span></span>
              <span>
                <md-outlined-text-field
                  type="textarea"
                  name="notice"
                  building-complex
                  .value=${this.project?.buildingComplex?.notice || ''}
                  @input=${this._onInputChange}
                ></md-outlined-text-field>
              </span>
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
        query Project($id: String!, $filters: [Filter!]) {
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
              }
              constructionType
              constructionCost
              etc
              notice
              householdCount
              buildingCount
              overallConstructorEmails
              taskConstructorEmails
              overallSupervisoryEmails
              taskSupervisoryEmails
              buildings {
                id
                name
                floorCount
              }
            }
          }

          employees(filters: $filters) {
            items {
              id
              name
              jobResponsibility
              active
              user {
                id
                name
                email
              }
            }
          }
        }
      `,
      variables: {
        id: projectId,
        filters: [
          {
            name: 'active',
            operator: 'eq',
            value: true
          },
          {
            name: 'userId',
            operator: 'is_not_null',
            value: ''
          }
        ]
      }
    })

    this.project = response.data?.project

    const items = response.data?.employees?.items || []
    this.overallConstructorList = this._filterUserByPermission(items, 'OVERALL_CONSTRUCTOR')
    this.taskConstructorList = this._filterUserByPermission(items, 'TASK_CONSTRUCTOR')
    this.overallSupervisoryList = this._filterUserByPermission(items, 'OVERALL_SUPERVISORY')
    this.taskSupervisoryList = this._filterUserByPermission(items, 'TASK_SUPERVISORY')
  }

  private _filterUserByPermission(userList, permission: string) {
    return userList
      .filter(v => v.jobResponsibility == permission || v.jobResponsibility == 'ADMIN')
      .map(v => ({ name: v.name, value: v.user.email }))
  }

  private async _saveProject() {
    // 첨부 파일 필드 제거 (첨부 파일은 {filename}Upload 로 전송)
    delete this.project.mainPhoto
    delete this.project.buildingComplex.drawing

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
      },
      context: {
        hasUpload: true
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

    // 리렌더링
    this.project = { ...this.project }
  }

  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent, idx: number) {
    const target = event.target as HTMLInputElement
    let inputVal: any = target.value

    // 숫자 타입은 다른 문자 입력 제거
    if (target.hasAttribute('numeric')) {
      inputVal = Number(inputVal.replace(/[^\d.]/g, ''))
    }

    if (target.hasAttribute('project')) {
      this.project[target.name] = inputVal
    } else if (target.hasAttribute('building-complex')) {
      this.project.buildingComplex![target.name] = inputVal
    } else if (target.hasAttribute('building')) {
      this.project.buildingComplex.buildings![idx][target.name] = inputVal
    }
  }

  // 이미지 업로드
  async onCreateAttachment(e: CustomEvent) {
    const target = e.target as HTMLInputElement
    const file = (target.name === 'mainPhoto' ? e.detail : e.detail[0]) || null

    if (target.name === 'mainPhoto') {
      this.project.mainPhotoUpload = file
    } else {
      this.project.buildingComplex.drawingUpload = file
    }
  }

  private _handleSelectionChange(e) {
    const name = e.target.getAttribute('name')
    const selectedValues = e.detail.selectedValues

    this.project.buildingComplex[name] = selectedValues
  }
}
