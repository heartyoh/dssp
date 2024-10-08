import '@material/web/icon/icon.js'
import '@operato/data-grist'

import { CommonGristStyles, CommonButtonStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { customElement, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'
import { openPopup } from '@operato/layout'

import './component/building-inspection-detail-header'
import '../checklist/checklist-view'
import { ChecklistMode } from '../checklist/checklist-view'

@customElement('building-inspection-detail-checklist')
export class BuildingInspectionDetailChecklist extends ScopedElementsMixin(PageView) {
  static styles = [
    ScrollbarStyles,
    CommonGristStyles,
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

      *[bold] {
        font-weight: bold;
      }

      div[body] {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;

        div[button-container] {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          gap: 10px;
          margin-right: 50px;
          margin-bottom: 15px;
        }
      }
    `
  ]

  @state() project: any = {}
  @state() buildingInspection: any = {}

  get context() {
    return {
      title: '검측 관리 상세 - 검측 체크리스트'
    }
  }

  render() {
    return html`
      <building-inspection-detail-header
        .buildingInspectionId=${this.buildingInspection?.id}
        .buildingLevelId=${this.buildingInspection?.buildingLevel?.id}
        .projectName=${this.project.name}
        .buildingName=${this.buildingInspection?.buildingLevel?.building?.name}
        .buildingLevelFloor=${this.buildingInspection?.buildingLevel?.floor}
      ></building-inspection-detail-header>

      <div body>
        <checklist-view
          .mode=${ChecklistMode.EDITOR}
          status=${this.buildingInspection.status}
          .checklist=${this.buildingInspection.checklist || {}}
        ></checklist-view>

        <div button-container>
          <md-elevated-button @click=${this._onClickModifyChecklist}>
            <md-icon slot="icon">assignment</md-icon>등록
          </md-elevated-button>
        </div>
      </div>
    `
  }

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      const buildingInspectionId = lifecycle.resourceId || ''
      await this.initBuildingInspection(buildingInspectionId)
    }
  }

  async initBuildingInspection(buildingInspectionId: string = '') {
    const response = await client.query({
      query: gql`
        query BuildingInspection($buildingInspectionId: String!) {
          buildingInspection(id: $buildingInspectionId) {
            id
            status
            requestDate
            checklist {
              id
              name
              constructionType
              constructionDetailType
              location
              inspectionParts
              documentNo
              constructionInspectionDate
              supervisorInspectionDate
              overallConstructorSignature
              taskConstructorSignature
              overallSupervisorySignature
              taskSupervisorySignature
              buildingInspection {
                status
              }
              checklistItems {
                id
                name
                sequence
                mainType
                detailType
                inspctionCriteria
                constructionConfirmStatus
                supervisoryConfirmStatus
                comment
              }
            }
            buildingLevel {
              id
              floor
              mainDrawing {
                id
                name
                fullpath
              }
              mainDrawingImage
              building {
                id
                name
                buildingComplex {
                  id
                }
              }
            }
          }
        }
      `,
      variables: {
        buildingInspectionId
      }
    })

    if (response.errors) return

    this.buildingInspection = response.data.buildingInspection

    await this._getProjectByBuildingComplexId(this.buildingInspection?.buildingLevel?.building?.buildingComplex?.id)
  }

  private async _getProjectByBuildingComplexId(buildingComplexId) {
    const response = await client.query({
      query: gql`
        query ProjectByBuildingComplexId($buildingComplexId: String!) {
          project: projectByBuildingComplexId(buildingComplexId: $buildingComplexId) {
            id
            name
          }
        }
      `,
      variables: {
        buildingComplexId
      }
    })

    if (response.errors) return

    this.project = response.data.project
  }

  private _onClickModifyChecklist() {
    this.validateChecklist(this.buildingInspection.checklist)
  }

  private async validateChecklist(checklist: any) {
    const response = await client.mutate({
      mutation: gql`
        mutation UpdateBuildingInspectionChecklist($buildingInspection: UpdateBuildingInspectionSubmitType!) {
          updateBuildingInspectionChecklist(buildingInspection: $buildingInspection)
        }
      `,
      variables: {
        buildingInspection: {
          id: this.buildingInspection.id,
          checklist: {
            id: checklist.id,
            overallConstructorSignature: checklist.overallConstructorSignature,
            taskConstructorSignature: checklist.taskConstructorSignature,
            overallSupervisorySignature: checklist.overallSupervisorySignature,
            taskSupervisorySignature: checklist.taskSupervisorySignature
          },
          checklistItem: checklist.checklistItems.map(item => ({
            id: item.id,
            constructionConfirmStatus: item.constructionConfirmStatus,
            supervisoryConfirmStatus: item.supervisoryConfirmStatus
          }))
        }
      }
    })

    if (!response.errors) {
      notify({ message: '검측요청서를 등록하였습니다.' })
      this.initBuildingInspection(this.buildingInspection.id)
    } else {
      notify({ message: response.errors?.[0]?.message || '검측 요청서 등록에 실패하였습니다.', level: 'error' })
    }
  }
}
