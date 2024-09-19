import '@material/web/icon/icon.js'
import '@operato/data-grist'

import { CommonGristStyles, CommonButtonStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { customElement, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { DataGrist, FetchOption } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'
import { openPopup } from '@operato/layout'

@customElement('building-inspection-detail-drawing')
export class buildingInspectionDetailDrawing extends ScopedElementsMixin(PageView) {
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
        display: flex;
        justify-content: center;
      }
    `
  ]

  @state() project: any = {}
  @state() buildingInspection: any = {}

  get context() {
    return {
      title: '검측 관리 상세 - 검측 도면'
    }
  }

  render() {
    return html`
      <div header>
        <h2>
          ${this.project.name} ${this.buildingInspection?.buildingLevel?.building?.name || ''}
          ${this.buildingInspection?.buildingLevel?.floor || ''}층
        </h2>
        <div button-container>
          <md-elevated-button href=${`building-inspection-detail-drawing/${this.buildingInspection.id}`}>
            <md-icon slot="icon">assignment</md-icon>검측도면
          </md-elevated-button>
          <md-elevated-button href=${`building-inspection-detail-checklist/${this.buildingInspection.id}`}>
            <md-icon slot="icon">description</md-icon>검측 체크리스트
          </md-elevated-button>
          <md-elevated-button href=${`building-inspection-detail-photo/${this.buildingInspection.id}`}>
            <md-icon slot="icon">description</md-icon>사진촬영
          </md-elevated-button>
        </div>
      </div>

      <div body>
        <img src=${this.buildingInspection?.buildingLevel?.mainDrawingImage || '/assets/images/img-drawing-default.png'} />
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
}
