import '@material/web/icon/icon.js'
import { CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { customElement, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'
import './component/building-inspection-detail-header'
import '@operato/image-marker/ox-image-marker.js'
import '@operato/image-marker/ox-image-marker-view.js'
import { BuildingInspectionStatus } from './building-inspection-list'

@customElement('building-inspection-detail-drawing')
export class BuildingInspectionDetailDrawing extends ScopedElementsMixin(PageView) {
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

        ox-image-marker-view {
          width: 100%;
        }
      }
    `
  ]

  @state() project: any = {}
  @state() buildingInspection: any = {}
  @state() buildingInspectionId: string = ''

  get context() {
    return {
      title: '검측 관리 상세 - 검측 도면'
    }
  }

  render() {
    const imageUrl = this.buildingInspection?.buildingLevel?.mainDrawingImage || '/assets/images/img-drawing-default.png'
    const shapes = JSON.parse(this.buildingInspection?.drawingMarker || null) || []

    return html`
      <building-inspection-detail-header
        .buildingInspectionId=${this.buildingInspection?.id}
        .buildingLevelId=${this.buildingInspection?.buildingLevel?.id}
        .projectName=${this.project.name}
        .buildingName=${this.buildingInspection?.buildingLevel?.building?.name}
        .buildingLevelFloor=${this.buildingInspection?.buildingLevel?.floor}
      ></building-inspection-detail-header>

      <div body>
        ${this.buildingInspection?.status == BuildingInspectionStatus.PASS
          ? html`<ox-image-marker-view .imageUrl=${imageUrl} .shapes=${shapes}></ox-image-marker-view>`
          : html` <ox-image-marker
              .imageUrl=${imageUrl}
              .shapes=${shapes}
              @shapes-changed=${this.onClickMarkerSave}
              .currentMode=${'view'}
            ></ox-image-marker>`}
      </div>
    `
  }

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      this.buildingInspectionId = lifecycle.resourceId || ''
      await this.initBuildingInspection(this.buildingInspectionId)
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
            drawingMarker
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

  private async onClickMarkerSave(e) {
    const response = await client.query({
      query: gql`
        mutation UpdateBuildingInspection($patch: UpdateBuildingInspectionDrawingMarker!) {
          updateBuildingInspection(patch: $patch) {
            id
            drawingMarker
          }
        }
      `,
      variables: {
        patch: {
          id: this.buildingInspectionId,
          drawingMarker: JSON.stringify(e.detail)
        }
      }
    })

    if (response.errors) return

    notify({ message: '저장되었습니다.' })
  }
}
