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
import './component/project-update-header'

@customElement('project-plan-management')
export class ProjectPlanManagement extends ScopedElementsMixin(PageView) {
  static styles = [
    css`
      :host {
        display: grid;
        grid-template-rows: 55px auto;
        color: #4e5055;

        background-color: var(--md-sys-color-background, #f6f6f6);
        overflow: hidden;
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

      ox-input-image {
        width: 100px;
        height: 100px;
      }

      *[bold] {
        font-weight: bold;
      }

      div[body] {
        display: grid;
        grid-template-rows: 205px 1fr 60px;
        margin: var(--spacing-large, 12px);
        margin-top:0;
        gap: var(--spacing-medium, 8px);

        & > div {
          display: grid;
          grid-template-rows: 25px auto;
          padding: var(--spacing-large, 12px);
          background-color: var(--md-sys-color-on-primary);
          border: 1px solid #cccccc80;
          border-radius: 5px;
          gap: var(--spacing-medium, 8px);

          h3 {
            color: #2e79be;
            font-size: 16px;
            margin: 0px;
            text-wrap: nowrap;
          }
        }

        & > div[building-container] > div {
          display: flex;
          gap: var(--spacing-medium, 8px);
          overflow-x: auto;
          overflow-y: hidden;

          ox-input-file {
            height: 100px;
          }

          span[building] {
            width: 125px;
            text-align: center;

            div {
              color: #586878;
              margin-top:var(--spacing-small, 4px);
              font-size: 14px;
            }
          }
        }

        & > div[floor-container] {
          div[floor-title] {
            display: flex;
            justify-content: space-between;
            height: fit-content;
            gap: var(--spacing-huge, 24px);
            overflow: hidden;

            span[building-button] {
              display: flex;
              margin-left: auto;
              gap: var(--spacing-small, 4px);
              overflow-x: auto;
              overflow-y: hidden;

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
            }
          }

          div[floor-plan] {
            overflow-y: auto;
            margin-top: var(--spacing-medium, 8px);

            & > span {
              display: inline-block;
              text-align: center;
              margin-right:var(--spacing-medium, 8px);
              margin-bottom:var(--spacing-medium, 8px);
              cursor: pointer;

              & > [name='building-plan'] {
                width: 150px;
                height: 100px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                border: 1px solid rgba(51,51,51,.1);
                box-shadow: 1px 1px 1px #0000001a;
                align-items: center;
                border-radius: 5px;
                font-size: 13px;

                md-icon {
                  margin-bottom: var(--spacing-small, 4px);
                }
              }

              & > div[floor-name] {
                margin-top: var(--spacing-small, 4px);
                font-size:14px;

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
            gap: var(--spacing-medium, 8px);
            margin-left: var(--spacing-medium, 8px);

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
      <project-update-header .projectId=${this.project.id || ''} title="도면 관리" @custom-click=${this._saveProject}>
      </project-update-header>

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
