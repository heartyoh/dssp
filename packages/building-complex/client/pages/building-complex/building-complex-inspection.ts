import '@material/web/icon/icon.js'
import '@material/web/button/elevated-button.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/button/outlined-button.js'

import { PageView } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, state, query } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import gql from 'graphql-tag'

export enum InspectionStatus {
  REQUEST = 'REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}
enum Mode {
  VIEW = 'view',
  EDIT = 'edit'
}

@customElement('building-complex-inspection')
export class BuildingComplexInspection extends ScopedElementsMixin(PageView) {
  static styles = [
    css`
      :host {
        display: grid;
        grid-template-rows: 75px auto;
        color: #4e5055;

        width: 100%;
        background-color: #f7f7f7;
        overflow-y: auto;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }

      md-filled-button {
        --md-filled-button-container-color: #0595e5;
        --md-filled-button-container-height: 30px;
        --md-filled-button-trailing-space: 15px;
        --md-filled-button-leading-space: 15px;
      }
      md-outlined-button {
        color: #586878;
        font-weight: bold;
        --md-outlined-button-label-text-size: 13px;
        --md-outlined-button-container-height: 30px;
        --md-outlined-button-trailing-space: 15px;
        --md-outlined-button-leading-space: 15px;
      }
      md-filled-select {
        width: auto;
        min-width: 150px;
        --md-filled-select-text-field-container-color: transparent;
        --md-filled-select-text-field-active-indicator-color: #999;
        --md-filled-select-text-field-input-text-size: 14px;
        --md-filled-select-text-field-input-text-weight: bold;
        --md-filled-select-text-field-input-text-line-height: 6px;
      }
      md-filled-select[level] {
        min-width: 110px;
        margin-left: 20px;
      }

      md-icon[request],
      md-icon[pass],
      md-icon[fail] {
        width: 20px;
        height: 20px;
        margin-right: 4px;
        border-radius: 5px;
        font-size: 21px;
        font-weight: 700;
        color: #fff;
      }
      md-icon[request] {
        background-color: #4e5055;
      }
      md-icon[pass] {
        background-color: #4bbb4a;
      }
      md-icon[fail] {
        background-color: #ff4444;
      }

      *[bold] {
        font-weight: bold;
      }

      div[header] {
        display: flex;
        margin: 0px 20px;

        h2 {
          flex: 0.5;
          color: #3f71a0;
        }

        div[button-container] {
          display: flex;
          align-items: center;
          justify-content: end;
          flex: 0.5;

          md-elevated-button {
            margin: 0px 3px;

            --md-elevated-button-container-height: 35px;
            --md-elevated-button-label-text-size: 16px;
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

      div[body] {
        display: grid;
        grid-template-columns: 1fr 200px;
        margin: 0px 25px 25px 25px;
        gap: 10px;
        min-height: fit-content;

        h3 {
          color: #2e79be;
          font-size: 18px;
          margin: 0px;
        }

        & > div {
          display: flex;
          gap: 10px;
          border-radius: 5px;
        }

        div[left] {
          flex-direction: column;

          div[select] {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #2ea4df1a;
            border: 1px solid #2ea4df33;
            font-size: 18px;
            padding: 7px 10px;
            border-radius: 5px;
            gap: 12px;

            & > div[state] {
              display: flex;
              font-size: 15px;
              margin-right: 12px;
              gap: 10px;

              & > span {
                display: flex;
                align-items: center;
                margin-left: 15px;
                gap: 2px;
              }
            }
          }

          div[drawing] {
            background-color: #ffffff;
            border: 1px solid #cccccc;
            border-radius: 5px;
            flex: 1;
            position: relative;
          }

          img {
            width: 100%;
            height: 100%;
          }

          div[grid] {
            display: flex;
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border: 1px #ccc solid;
            justify-content: space-between;

            & > div[row] {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              flex: 1;

              & > div[column] {
                flex: 1;
                border: dashed 1px #2ea4df99;
                display: flex;
                justify-content: center;
                align-items: center;
              }
            }

            div[row='1'] div[column] {
              border-left: none !important;
            }
            div[row='10'] div[column] {
              border-right: none !important;
            }
            div[column='1'] {
              border-top: none !important;
            }
            div[column='10'] {
              border-bottom: none !important;
            }

            div[cell][active] {
              background-color: #2ea4df99;
            }
          }
        }

        div[right] {
          flex-direction: column;
          gap: 15px;

          & > div {
            background-color: #ffffff;
            border: 1px solid #cccccc80;
            padding: 11px 12px 15px 12px;
            border-radius: 5px;
          }

          div[top] {
            div[content] {
              display: flex;
              align-items: center;
              margin-top: 8px;
              justify-content: space-between;

              span {
                display: flex;
                align-items: center;
                min-width: 55px;
              }
            }
          }

          div[bottom] {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 10px;

            & > div {
              display: flex;
              flex-direction: column;
              gap: 9px;

              hr {
                border: 1px #cccccc dashed;
                width: 100%;
                margin: 0;
              }
            }

            div[view] {
              flex: 1;

              div[status] {
                display: flex;
                align-items: center;
                margin-bottom: 7px;
              }
              div[date] {
                font-size: 12px;
              }

              div[desc],
              div[manager] {
                font-size: 14px;
              }
            }

            div[edit] {
              flex: 1;
            }
          }
        }
      }
    `
  ]

  get context() {
    return {
      title: '동별 시공검측 상세 정보'
    }
  }

  private defaultProject = {
    name: '',
    buildingComplex: {
      buildings: []
    }
  }
  @state() project: any = { ...this.defaultProject }
  @state() selectedBuilding: any = {}
  @state() selectedLevel: any = {}
  @state() selectedInspection: any = {}
  @state() mode: Mode = Mode.VIEW

  @query('md-filled-select[building]') htmlSelectBuilding
  @query('md-filled-select[level]') htmlSelectLevel

  render() {
    return html`
      <div header>
        <h2>${this.project.name} ${this.selectedBuilding?.name} ${this.selectedLevel?.floor}층</h2>
        <div button-container>
          <md-elevated-button href=${`project-update/${this.project.id}`}>
            <md-icon slot="icon">assignment</md-icon>프로젝트 정보 수정
          </md-elevated-button>
          <md-elevated-button href=${`project-plan-management/${this.project.id}`}>
            <md-icon slot="icon">description</md-icon>도면 관리
          </md-elevated-button>
        </div>
      </div>

      <div body>
        <div left>
          <div select>
            <div>
              <md-filled-select building @change=${this._onSelectBuilding}>
                ${this.project?.buildingComplex?.buildings?.map(building => {
                  const selected = building.id === this.selectedBuilding?.id
                  console.log('building')
                  return html` <md-select-option ?selected=${selected} .value=${building.id}>
                    <div slot="headline">${building.name}</div>
                  </md-select-option>`
                })}
              </md-filled-select>

              <md-filled-select level @change=${this._onSelectBuildingLevel}>
                ${this.selectedBuilding?.buildingLevels?.map(level => {
                  console.log('buildingLevels')
                  const selected = level.id === this.selectedLevel.id
                  return html`<md-select-option ?selected=${selected} .value=${level.id}>
                    <div slot="headline">${level.floor}</div>
                  </md-select-option>`
                })}
              </md-filled-select>
            </div>

            <div state>
              <span><md-icon request slot="icon">exclamation</md-icon> 검측요청 <span bold>100</span></span>
              <span><md-icon pass slot="icon">check</md-icon> 합격 <span bold>100</span></span>
              <span><md-icon fail slot="icon">close</md-icon> 불합격 <span bold>100</span></span>
            </div>
          </div>

          <div drawing>
            <img src=${this.selectedLevel?.mainDrawingImage || ''} />

            <div grid>
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                v =>
                  html` <div row=${v}>
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                      vv =>
                        html`<div column=${vv} cell=${`${vv},${v}`} buildingInspection="" @click=${this._onClickGrid}>
                          ${vv}, ${v}
                        </div>`
                    )}
                  </div>`
              )}
            </div>
          </div>
        </div>

        <div right>
          <div top bold>
            <div>신규 등록 현황</div>
            <div content>
              <span><md-icon request slot="icon">exclamation</md-icon> 100</span>
              <span><md-icon pass slot="icon">check</md-icon> 50</span>
              <span><md-icon fail slot="icon">close</md-icon> 5</span>
            </div>
          </div>

          <div bottom>
            <div name bold>시공검측 세부사항</div>
            ${this.mode === Mode.VIEW
              ? html`
                  <div view>
                    <div>
                      <div status>
                        ${!this.selectedInspection.status
                          ? ''
                          : this.selectedInspection.status == InspectionStatus.REQUEST
                            ? html`<md-icon request slot="icon">exclamation</md-icon>`
                            : this.selectedInspection.status == InspectionStatus.PASS
                              ? html`<md-icon pass slot="icon">check</md-icon>`
                              : html`<md-icon fail slot="icon">close</md-icon>`}
                        <span bold> ${InspectionStatus[this.selectedInspection.status]}</span>
                      </div>
                      <div date>검측일 : ${this.selectedInspection.createdAt}</div>
                    </div>
                    <hr />
                    <div desc>${this.selectedInspection.detail} <img /></div>
                    <hr />
                    <div manager>
                      담당자 : 김단국 <br />
                      010-1234-1234
                    </div>
                    <hr />
                  </div>

                  <md-outlined-button @click=${() => this._onClickChangeViewMode(Mode.EDIT)}>
                    검측 정보 및 상태 수정
                  </md-outlined-button>
                `
              : html`
                  <div edit>
                    ${console.log(Object.values(InspectionStatus))}
                    <select>
                      <option .value=${InspectionStatus.REQUEST}>검측 요청</option>
                      <option .value=${InspectionStatus.PASS}>합격</option>
                      <option .value=${InspectionStatus.FAIL}>불합격</option>
                    </select>

                    <textarea .value=${this.selectedInspection.detail || ''}></textarea>

                    <div>
                      <button type="button">사진파일 업로드</button>
                      <button type="button">결함파일 업로드</button>
                    </div>

                    <label for="assignee">담당자 선택</label>
                    <select id="assignee" name="assignee">
                      <option>담당자 1</option>
                    </select>
                    <label>
                      <input type="checkbox" name="apply-to-all" checked />
                      전층 동일 적용
                    </label>
                  </div>
                  <md-filled-button @click=${() => this._onClickChangeViewMode(Mode.VIEW)}>
                    검측정보 저장
                  </md-filled-button>
                `}
          </div>
        </div>
      </div>
    `
  }

  async pageInitialized(lifecycle: PageLifecycle) {}

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      const params: any = lifecycle.params
      await this.initProject(lifecycle.resourceId, params.buildingId, params.levelId)
    }
  }

  async initProject(projectId: string = '', buildingId: string = '', levelId: string = '') {
    const response = await client.query({
      query: gql`
        query Project($id: String!) {
          project(id: $id) {
            id
            name
            buildingComplex {
              id
              buildings {
                id
                name
              }
            }
          }
        }
      `,
      variables: {
        id: projectId
      }
    })

    if (response.errors) return

    this.project = response.data?.project

    // buildingId 파라미터가 있으면 선택된 빌딩, 없으면 첫번째 빌딩 선택
    this.selectedBuilding = buildingId
      ? this.project?.buildingComplex?.buildings?.filter(v => v.id === buildingId)[0]
      : this.project?.buildingComplex?.buildings?.[0]

    // 선택된 동의 층 리스트 가져오기
    this.selectedBuilding = await this._getBuilding(this.selectedBuilding.id)

    // levelId 파라미터가 있으면 선택된 층, 없으면 첫번째 층 선택
    this.selectedLevel = levelId
      ? this.selectedBuilding?.buildingLevels?.filter(v => v.id === levelId)[0]
      : this.selectedBuilding?.buildingLevels?.[0]

    // 동, 층이 랜더링 된 후에 select를 위해 이 시점에서 랜더링
    this.selectedBuilding = await { ...this.selectedBuilding }

    // 기본 값 셋팅 select
    await this.htmlSelectBuilding.select(this.selectedBuilding.id)
    await this.htmlSelectLevel.select(this.selectedLevel.id)
  }

  async _getBuilding(buildingId: string = '') {
    const response = await client.query({
      query: gql`
        query Building($id: String!) {
          building(id: $id) {
            id
            name
            buildingLevels {
              id
              floor
              floorInspectionSummary {
                request
                pass
                fail
              }
              mainDrawing {
                id
                name
                fullpath
              }
              mainDrawingImage
            }
          }
        }
      `,
      variables: {
        id: buildingId
      }
    })

    if (response.errors) return

    return response.data?.building || {}
  }

  async _getBuildingInspection(buildingInspectionId: string = '') {
    const response = await client.query({
      query: gql`
        query BuildingInspection($id: String!) {
          buildingInspection(id: $id) {
            id
            indexX
            indexY
            status
            detail
            createdAt
            attachments
          }
        }
      `,
      variables: {
        id: buildingInspectionId
      }
    })

    if (response.errors) return

    return response.data?.buildingInspection || {}
  }

  private async _onSelectBuilding(e) {
    const buildingId = e.target.value
    // this.building = await this._getBuilding(buildingId)
    this.selectedBuilding = await this._getBuilding(buildingId)
    this.selectedLevel = { ...this.selectedBuilding?.buildingLevels?.[0] }
  }

  private _onSelectBuildingLevel(e) {
    const buildingLevelId = e.target.value
    this.selectedLevel = {
      ...(this.selectedBuilding?.buildingLevels?.find(v => v.id == buildingLevelId) || {})
    }
  }

  private async _onClickGrid(e) {
    const target = e.target
    const buildingInspectionId = e.target.getAttribute('buildingInspectionId')
    const cell = e.target.getAttribute('cell')

    // active 속성 모두 제거후 클릭한 셀만 active로 변경
    this.shadowRoot?.querySelectorAll('div[cell][active]').forEach(e => e.removeAttribute('active'))
    target.setAttribute('active', true)

    this.selectedInspection = buildingInspectionId ? await this._getBuildingInspection(buildingInspectionId) : {}

    console.log('buildingInspectionId : ', buildingInspectionId)
    console.log('cell : ', cell)
  }

  private _onClickChangeViewMode(mode: Mode = Mode.VIEW) {
    this.mode = mode
  }
}
