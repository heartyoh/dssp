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

import './component/building-inspection-detail-header'

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
      <building-inspection-detail-header
        .buildingInspectionId=${this.buildingInspection?.id}
        .projectName=${this.project.name}
        .buildingName=${this.buildingInspection?.buildingLevel?.building?.name}
        .buildingLevelFloor=${this.buildingInspection?.buildingLevel?.floor}
      ></building-inspection-detail-header>

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
