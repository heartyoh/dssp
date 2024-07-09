import '@material/web/icon/icon.js'
import '@material/web/button/elevated-button.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'

import { PageView } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import { openPopup } from '@operato/layout'

import gql from 'graphql-tag'
import { Building, BuildingLevel, Project } from './project-list'
import './popup/popup-plan-upload'

@customElement('project-plan-management')
export class ProjectPlanManagement extends ScopedElementsMixin(PageView) {
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

      md-outlined-text-field {
        width: 100%;

        --md-outlined-text-field-container-shape: 5px;
        --md-sys-color-primary: #586878;
        --md-outlined-text-field-input-text-size: 14px;
        --md-outlined-field-bottom-space: 4px;
        --md-outlined-field-top-space: 4px;
      }

      ox-input-image {
        width: 100px;
        height: 100px;
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

            &[green] {
              --md-elevated-button-container-color: #42b382;
            }
          }
        }
      }

      div[body] {
        display: grid;
        grid-template-rows: 240px 400px 60px;
        margin: 0px 25px 25px 25px;
        gap: 8px;

        & > div {
          display: grid;
          grid-template-rows: 25px auto;
          padding: 15px;
          background-color: #ffffff;
          border: 1px solid #cccccc80;
          border-radius: 5px;
          gap: 14px;

          h3 {
            color: #2e79be;
            font-size: 18px;
            margin: 0px;
          }
        }

        & > div[building-container] > div {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          overflow-y: hidden;

          ox-input-file {
            height: 120px;
          }
          span[building] {
            width: 125px;
            text-align: center;

            div {
              color: #586878;
              margin-top: 7px;
            }
          }
        }

        & > div[floor-container] {
          div[floor-title] {
            display: flex;
            justify-content: space-between;
            height: fit-content;

            span[building-button] {
              display: flex;
              max-width: 500px;
              gap: 10px;
              overflow-x: auto;
              overflow-y: hidden;

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
            }
          }

          div[floor-plan] {
            overflow-y: auto;
            margin-top: 10px;

            & > span {
              display: inline-block;
              text-align: center;
              margin: 0px 10px 15px 0px;
              cursor: pointer;

              & > [name='building-plan'] {
                width: 150px;
                height: 100px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                border: 1px solid #333;
                box-shadow: 2px 2px 2px #0000001a;
                align-items: center;
                border-radius: 7px;
                font-size: 13px;

                md-icon {
                  margin-bottom: 6px;
                }
              }

              & > div[floor-name] {
                margin-top: 7px;

                &[no-data] {
                  color: #f16154;
                  font-weight: bold;
                }
              }
            }
          }
        }

        & > div[plan-scale-container] {
          display: flex;

          & > div {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-left: 10px;

            md-outlined-text-field {
              width: 100px;
              --md-outlined-text-container-height: 30px;
            }
          }
        }
      }
    `
  ]

  get context() {
    return {
      title: '도면 관리'
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
  @state() selectedBuildingIdx: number = 0

  render() {
    return html`
      <div header>
        <h2>도면 관리</h2>
        <div button-container>
          <md-elevated-button green @click=${this._saveProject}>
            <md-icon slot="icon">save</md-icon>정보 저장
          </md-elevated-button>
          <md-elevated-button href=${`project-update/${this.project.id}`}>
            <md-icon slot="icon">assignment</md-icon>프로젝트 정보 수정
          </md-elevated-button>
          <md-elevated-button href=${`project-task-update/${this.project.id}`}>
            <md-icon slot="icon">event_note</md-icon>공정표 관리
          </md-elevated-button>
        </div>
      </div>

      <div body>
        <div building-container>
          <h3>동별 도면(BIM)</h3>
          <div>
            ${this.project.buildingComplex?.buildings?.map((building, idx) => {
              return html`
                <span building>
                  <ox-input-file
                    name="building-drawing"
                    .value=${building?.drawing || undefined}
                    label=" "
                    description="동 도면 업로드"
                    idx=${idx}
                    @change=${this._onCreateAttachment.bind(this)}
                  ></ox-input-file>
                  <div>${building.name}</div>
                </span>
              `
            })}
          </div>
        </div>

        <div floor-container>
          <div floor-title>
            <h3>${this.project.buildingComplex?.buildings?.[this.selectedBuildingIdx]?.name} 층별 도면(PDF)</h3>
            <span building-button>
              ${this.project.buildingComplex.buildings?.map((building, idx) => {
                return this.project.buildingComplex?.buildings?.[this.selectedBuildingIdx]?.id === building.id
                  ? html`
                      <md-filled-button @click=${() => this._onClickBuildingChange(idx)}> ${building.name} </md-filled-button>
                    `
                  : html`
                      <md-outlined-button @click=${() => this._onClickBuildingChange(idx)}> ${building.name} </md-outlined-button>
                    `
              })}
            </span>
          </div>

          <div floor-plan>
            ${this.project.buildingComplex?.buildings?.[this.selectedBuildingIdx]?.buildingLevels?.map((buildingLevel, idx) => {
              return buildingLevel.mainDrawingThumbnail
                ? html`
                    <span plan>
                      <img
                        name="building-plan"
                        .src=${buildingLevel.mainDrawingThumbnail}
                        idx=${idx}
                        @click=${this._onClickImage}
                      />
                      <div floor-name>${buildingLevel.floor}층</div>
                    </span>
                  `
                : html`
                    <span plan>
                      <a name="building-plan" idx=${idx} @click=${this._onClickImage}>
                        <md-icon slot="icon">image</md-icon>
                        <div bold>도면 파일</div>
                        <div>업로드</div>
                      </a>
                      <div floor-name no-data>${buildingLevel.floor}층</div>
                    </span>
                  `
            })}
          </div>
        </div>

        <div plan-scale-container>
          <h3>도면 축척 설정</h3>
          <div>
            <span>가로</span>
            <md-outlined-text-field
              type="text"
              name="planXScale"
              numeric
              .value=${this.project.buildingComplex.planXScale?.toString() || ''}
              @input=${this._onInputChange}
              suffix-text="mm"
            >
            </md-outlined-text-field>
            <span>X</span>
            <span>세로</span>
            <md-outlined-text-field
              type="text"
              name="planYScale"
              numeric
              .value=${this.project.buildingComplex.planYScale?.toString() || ''}
              @input=${this._onInputChange}
              suffix-text="mm"
            >
            </md-outlined-text-field>
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
            buildingComplex {
              id
              planXScale
              planYScale
              buildings {
                id
                name
                drawing {
                  id
                  name
                }
                buildingLevels {
                  id
                  floor
                  mainDrawing {
                    id
                    name
                  }
                  elevationDrawing {
                    id
                    name
                  }
                  rebarDistributionDrawing {
                    id
                    name
                  }
                  mainDrawingThumbnail
                  elevationDrawingThumbnail
                  rebarDistributionDrawingThumbnail
                }
              }
            }
          }
        }
      `,
      variables: {
        id: projectId
      }
    })

    this.project = response.data?.project

    console.log('init project : ', this.project)
  }

  private async _saveProject() {
    // 첨부 파일 필드 제거 (첨부 파일은 {filename}Upload 로 전송)
    for (let buildingKey in this.project.buildingComplex.buildings) {
      const building = this.project.buildingComplex.buildings[buildingKey]
      delete this.project.buildingComplex.buildings[buildingKey].drawing

      for (let levelKey in building.buildingLevels) {
        delete this.project.buildingComplex.buildings[buildingKey].buildingLevels[levelKey].mainDrawing
        delete this.project.buildingComplex.buildings[buildingKey].buildingLevels[levelKey].mainDrawingImage
        delete this.project.buildingComplex.buildings[buildingKey].buildingLevels[levelKey].mainDrawingThumbnail
        delete this.project.buildingComplex.buildings[buildingKey].buildingLevels[levelKey].elevationDrawing
        delete this.project.buildingComplex.buildings[buildingKey].buildingLevels[levelKey].elevationDrawingThumbnail
        delete this.project.buildingComplex.buildings[buildingKey].buildingLevels[levelKey].rebarDistributionDrawing
        delete this.project.buildingComplex.buildings[buildingKey].buildingLevels[levelKey].rebarDistributionDrawingThumbnail
      }
    }

    console.log('upload project :', this.project)

    const response = await client.mutate({
      mutation: gql`
        mutation UpdateProjectPlan($project: ProjectPatch!) {
          updateProjectPlan(project: $project) {
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

      // 데이터 다시 조회
      this.initProject(this.project.id)
    }
  }

  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent, idx: number) {
    const target = event.target as HTMLInputElement
    let inputVal: any = target.value
    this.project.buildingComplex![target.name] = Number(inputVal.replace(/\D/g, ''))
  }

  // 이미지 업로드
  async _onCreateAttachment(e: CustomEvent) {
    const target = e.target as HTMLInputElement
    const file = e.detail[0] || null
    const idx = Number(target.getAttribute('idx')) || 0

    this.project.buildingComplex!.buildings![idx].drawingUpload = file

    // re rendering
    this.project = { ...this.project }
  }

  _onClickBuildingChange(idx: number) {
    this.selectedBuildingIdx = idx
  }

  _onClickImage(e) {
    const target = e.currentTarget as HTMLInputElement
    const idx = Number(target.getAttribute('idx')) || 0
    const buildingLevel = this.project.buildingComplex!.buildings![this.selectedBuildingIdx].buildingLevels![idx]
    const title = buildingLevel.floor?.toString() + '층' || ''

    // 팝업 오픈
    this._openPopup(title, buildingLevel, idx)
  }

  private _openPopup(title: string, buildingLevel: BuildingLevel, selectedIdx: number) {
    openPopup(
      html`<popup-plan-upload
        .buildingLevel=${buildingLevel}
        .selectedIdx=${selectedIdx}
        @file_change=${this._onChangeAdditionalDrawing.bind(this)}
      ></popup-plan-upload>`,
      {
        backdrop: true,
        size: 'medium',
        title: `${title} 도면 관리`
      }
    )
  }

  private _onChangeAdditionalDrawing(e) {
    const idx = e.detail?.selectedIdx || null
    const buildingLevel: BuildingLevel = e.detail?.buildingLevel || {}

    this.project.buildingComplex!.buildings![this.selectedBuildingIdx]!.buildingLevels![idx] = { ...buildingLevel }
  }
}
