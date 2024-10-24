import '@material/web/icon/icon.js'
import '@material/web/button/elevated-button.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/button/outlined-button.js'
import '@operato/input/ox-select-floor.js'

import { ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import gql from 'graphql-tag'

@customElement('building-complex-detail')
export class BuildingComplexDetail extends ScopedElementsMixin(PageView) {
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

      md-filled-button {
        --md-filled-button-container-color: #0595e5;
        --md-filled-button-container-height: 30px;
        --md-filled-button-trailing-space: var(--spacing-medium, 8px);
        --md-filled-button-leading-space: var(--spacing-medium, 8px);
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
      }

      div[header] h2 {
        flex: 0.5;
        color: #3f71a0;
        font-size:18px;
      }

      div[header] div[button-container] {
        display: flex;
        align-items: center;
        justify-content: end;
        flex: 0.5;
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
      }

      div[body] {
        display: grid;
        grid-template-columns: 4fr 6fr;
        margin: var(--spacing-large, 12px);
        margin-top:0;
        gap: var(--spacing-medium, 8px);
        min-height: fit-content;
        overflow-x: hidden;
      }

      h3 {
        color: #2e79be;
        font-size: 16px;
        margin: 0px;
      }

      div[body] > div {
        display: flex;
        gap: var(--spacing-medium, 8px);
        padding: var(--spacing-large, 12px);
        border-radius: 5px;
      }

      div[left] {
        flex-direction: column;
        background-color: var(--md-sys-color-on-primary);
        border: 1px solid #cccccc80;
      }

      div[drawing] {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      [building-img] {
        width: 70%;
        height: auto;
      }

      div[drawing] img[building-img] {
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
      }

      div[right] {
        height: auto;
        overflow-x: hidden;
        overflow-y: auto;
        flex-direction: column-reverse;
        position: relative;
      }

      ox-select-floor {
        width: 100%;

        --ox-select-floor-rotate-x: 60deg;
        --ox-select-floor-rotate-x-active: 30deg;
        --ox-select-floor-perspective: 1200px;

        user-select: none;
        overflow-y: auto;
      }

      div[status] {
        display: flex;
        position: absolute;
        right: 0px;
        bottom: 0px;
        align-items: center;
        z-index: 2;
        right: 3%;
      }

      div[status] > div[content] {
        display: flex;
        background-color: #4e5055;
        color: #fff;
        padding: var(--spacing-small, 4px) var(--spacing-medium, 8px);
        border-radius: 5px;
        gap: var(--spacing-medium, 8px);
        font-size: 14px;
      }

      div[status] span {
        display: flex;
        align-items: center;
        width: 48px;
        font-weight:bold;
      }

      div[status] md-icon {
        width: 16px;
        height: 16px;
        margin-right: var(--spacing-small, 4px);
        border-radius: 5px;
        font-size: 16px;
        font-weight: 700;
      }
      div[status] md-icon[wait] {
        background-color: #f7f7f7;
        color: #4e5055;
      }
      div[status] md-icon[request] {
        background-color: #f7f7f7;
        color: #4e5055;
      }
      div[status] md-icon[pass] {
        background-color: #4bbb4a;
      }
      div[status] md-icon[fail] {
        background-color: #ff4444;
      }

      span[name] {
        width: 40px;
        color: #4e5055;
        margin-left: 6px;
        text-align: center;
      }

      span[name][active] {
        color: var(--md-sys-color-on-error);
        background-color: var(--md-sys-color-error);
        border-radius: 999px;
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
  @state() building: any = {}
  @state() currentFloor: number = -1

  render() {
    const cards =
      this.building?.buildingLevels?.map(({ mainDrawingImage, floor }) => {
        return {
          image: mainDrawingImage || '/assets/images/img-drawing-default.png',
          name: floor
        }
      }) || []

    return html`
      <div header>
        <h2>${this.project.name} ${this.selectedBuilding.name}</h2>
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
          <h3>${this.selectedBuilding.name} BIM도면</h3>
          <div drawing>
            ${this.selectedBuilding?.drawing?.fullpath
              ? html`<div building-img></div>`
              : html`<img building-img src="/assets/images/img-building-default.png" />`}
          </div>
          <div>
            <div subject bold>개별 단지 상세정보 바로가기</div>
            <div building-container>
              ${this.project.buildingComplex?.buildings?.map(building => {
                return this.selectedBuilding.id === building.id
                  ? html`
                      <md-filled-button @click=${() => this._onClickBuilding(building)}> ${building.name} </md-filled-button>
                    `
                  : html`
                      <md-outlined-button @click=${() => this._onClickBuilding(building)}> ${building.name} </md-outlined-button>
                    `
              })}
            </div>
          </div>
        </div>

        <div right>
          <ox-select-floor
            .cards=${cards}
            .bottomLimit=${70}
            .interval=${50}
            @change=${(e: CustomEvent) => {
              this.currentFloor = e.detail
              console.log('currentFloor', this.currentFloor)
            }}
          >
            ${this.building?.buildingLevels?.map(
              ({ id, floor, inspectionSummary }, idx) => html`
                  <a href=${`building-inspection-list/${id}`} slot="template-${idx}">
                    <div status>
                      <div content>
                        <span><md-icon wait slot="icon">hourglass_empty</md-icon>${inspectionSummary.wait}</span>
                        <span><md-icon request slot="icon">exclamation</md-icon>${inspectionSummary.request}</span>
                        <span><md-icon pass slot="icon">check</md-icon>${inspectionSummary.pass}</span>
                        <span><md-icon fail slot="icon">close</md-icon>${inspectionSummary.fail}</span>
                      </div>
                      <span name ?active=${this.currentFloor == floor}>${floor}층</span>
                    </div>
                  </a>
                </div>
              `
            )}
          </ox-select-floor>
        </div>
      </div>
    `
  }

  async pageInitialized(lifecycle: PageLifecycle) {}

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      const params: any = lifecycle.params
      await this.initProject(lifecycle.resourceId, params.buildingId)
    }
  }

  async initProject(projectId: string = '', buildingId: string = '') {
    const response = await client.query({
      query: gql`
        query Project($id: String!) {
          project(id: $id) {
            id
            name
            mainPhoto {
              fullpath
            }
            buildingComplex {
              id
              drawing {
                id
                name
                fullpath
              }
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
      ? this.project?.buildingComplex?.buildings.filter(v => v.id === buildingId)[0]
      : this.project?.buildingComplex?.buildings[0]

    // 좌측 빌딩 도면 불러오기
    this._getBuilding(this.selectedBuilding.id)
  }

  async _getBuilding(buildingId: string = '') {
    const response = await client.query({
      query: gql`
        query Building($id: String!) {
          building(id: $id) {
            id
            buildingLevels {
              id
              floor
              mainDrawing {
                id
                name
                fullpath
              }
              mainDrawingImage
              inspectionSummary {
                wait
                request
                pass
                fail
              }
            }
          }
        }
      `,
      variables: {
        id: buildingId
      }
    })

    if (response.errors) return

    this.building = response.data?.building
  }

  private _onClickBuilding(building) {
    this.selectedBuilding = { ...building }
    this._getBuilding(this.selectedBuilding.id)
  }
}
