import { PageView } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
// import { Project, Building } from '@dssp/project'
import gql from 'graphql-tag'
import '@material/web/button/elevated-button.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/button/outlined-button.js'

@customElement('building-complex-detail')
export class BuildingComplexDetail extends ScopedElementsMixin(PageView) {
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
        --md-outlined-button-container-height: 30px;
        --md-outlined-button-trailing-space: 15px;
        --md-outlined-button-leading-space: 15px;
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
        grid-template-columns: 4fr 6fr;
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
          padding: 15px;
          border-radius: 5px;
        }

        div[left] {
          flex-direction: column;
          background-color: #ffffff;
          border: 1px solid #cccccc80;

          img {
            width: 100%;
          }

          div[drawing] {
            flex: 1;
          }

          div[subject] {
            margin-bottom: 7px;
          }
          div[building-container] {
            display: block;
            height: 40px;
            overflow-y: auto;

            & > * {
              margin-right: 2px;
              margin-bottom: 7px;
            }
          }
        }

        div[right] {
          height: auto;
          overflow-x: hidden;
          overflow-y: auto;
          flex-direction: column-reverse;

          div[row] {
            width: 100%;
            position: relative;
            margin-top: -9%;

            div[drawing] {
              padding-right: 10%;

              & > div {
                display: flex;
                padding: 8px;
              }

              [floor-drawing] {
                width: 100%;
                aspect-ratio: 7;
                clip-path: polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%);
                -webkit-clip-path: polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%);
                opacity: 0.5;
              }
            }

            div[status] {
              display: flex;
              position: absolute;
              right: 0px;
              bottom: 0px;
              align-items: center;
              z-index: 2;

              div[content] {
                display: flex;
                background-color: #4e5055;
                color: #fff;
                padding: 5px 7px;
                border-radius: 7px;
                gap: 10px;
                font-size: 14px;

                span {
                  display: flex;
                  align-items: center;
                  width: 48px;

                  md-icon {
                    width: 20px;
                    height: 20px;
                    margin-right: 4px;
                    border-radius: 5px;
                    font-size: 21px;
                    font-weight: 700;
                  }
                  md-icon[request] {
                    background-color: #f7f7f7;
                    color: #4e5055;
                  }
                  md-icon[pass] {
                    background-color: #4bbb4a;
                  }
                  md-icon[fail] {
                    background-color: #ff4444;
                  }
                }
              }
              span[name] {
                color: #4e5055;
                margin-left: 6px;
              }
            }

            &:hover {
              z-index: 1;

              div[drawing] {
                & > div {
                  display: flex;
                  background-color: #ff6a5d;
                  justify-content: center;
                  padding: 10px;
                  clip-path: polygon(
                    calc(18% + 10px) 5px,
                    calc(82% - 10px) 5px,
                    calc(100% - 5px) calc(100% - 5px),
                    5px calc(100% - 5px)
                  );
                  -webkit-clip-path: polygon(
                    calc(18% + 10px) 5px,
                    calc(82% - 10px) 5px,
                    calc(100% - 5px) calc(100% - 5px),
                    5px calc(100% - 5px)
                  );

                  [floor-drawing] {
                    opacity: 1;
                    width: calc(100% - 20px);
                  }
                }
              }
              span[name] {
                font-weight: bold;
              }
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
  @state() building: any = {}

  render() {
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
          <div drawing><img src=${this.project.buildingComplex?.drawing?.fullpath || ''} /></div>
          <div>
            <div subject bold>개별 단지 상세정보 바로가기</div>
            <div building-container>
              ${this.project.buildingComplex?.buildings?.map(building => {
                return this.selectedBuilding.id === building.id
                  ? html`
                      <md-filled-button @click=${() => this._onClickBuilding(building)}>
                        ${building.name}
                      </md-filled-button>
                    `
                  : html`
                      <md-outlined-button @click=${() => this._onClickBuilding(building)}>
                        ${building.name}
                      </md-outlined-button>
                    `
              })}
            </div>
          </div>
        </div>

        <div right>
          ${this.building?.buildingLevels?.map(buildingLevel => {
            return html`
              <div row>
                <a
                  href=${`building-complex-inspection/${this.project.id}?buildingId=${this.selectedBuilding.id}&levelId=${buildingLevel.id}`}
                >
                  <div drawing>
                    <div>
                      <img floor-drawing src=${buildingLevel?.mainDrawingThumbnail || ''} />
                    </div>
                  </div>
                  <div status>
                    <div content>
                      <span><md-icon request slot="icon">exclamation</md-icon>100</span>
                      <span><md-icon pass slot="icon">check</md-icon>50</span>
                      <span><md-icon fail slot="icon">close</md-icon>5</span>
                    </div>
                    <span name>${buildingLevel.floor}층</span>
                  </div>
                </a>
              </div>
            `
          })}
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
    console.log('init project : ', this.project)
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
              mainDrawingThumbnail
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
    console.log('this.building :', this.building)
  }

  private _onClickBuilding(building) {
    this.selectedBuilding = { ...building }
    this._getBuilding(this.selectedBuilding.id)
  }
}
