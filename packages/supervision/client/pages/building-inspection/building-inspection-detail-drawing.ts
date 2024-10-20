import '@material/web/icon/icon.js'
import '@operato/image-marker/ox-image-marker.js'
import '@operato/image-marker/ox-image-marker-view.js'

import gql from 'graphql-tag'
import { css, html, PropertyValues } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'

import { PageView } from '@operato/shell'
import { CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import { ImageProvider, Shape } from '@operato/image-marker'

import { DrawingImageProvider } from '@dssp/drawing/dist-client/drawing-management/drawing-image-provider.js'

import './component/building-inspection-detail-header'
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
  @state() imageUrl?: string
  @state() shapes: Shape[] = []

  @state() drawingImageProvider: DrawingImageProvider = new DrawingImageProvider()
  // @consume({ context: OxUserPreferencesContext, subscribe: true })

  @query('ox-image-marker') imageMarker!: any

  get context() {
    return {
      title: '검측 관리 상세 - 검측 도면'
    }
  }

  connectedCallback(): void {
    super.connectedCallback()

    requestAnimationFrame(() => {
      this.imageMarker.setImageProvider(this.drawingImageProvider)
    })
  }

  disconnectedCallback(): void {
    this.imageMarker?.setImageProvider(null)

    super.disconnectedCallback()
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
        ${this.buildingInspection?.status == BuildingInspectionStatus.PASS
          ? html`<ox-image-marker-view .imageUrl=${this.imageUrl} .shapes=${this.shapes}></ox-image-marker-view>`
          : html` <ox-image-marker
              .imageUrl=${this.imageUrl}
              .shapes=${this.shapes}
              @shapes-changed=${this.onClickMarkerSave}
              .currentMode=${'view'}
            ></ox-image-marker>`}
      </div>
    `
  }

  protected async updated(changes: PropertyValues): Promise<void> {
    if (changes.has('buildingInspection')) {
      const dwgId = 'A-1006' // this.buildingInspection?.buildingLevel?.mainDrawingImage || '/assets/images/img-drawing-default.png'

      const shapes = JSON.parse(this.buildingInspection?.drawingMarker || null) || []
      const markers = await this.drawingImageProvider.getMarkers(dwgId)

      this.imageUrl = dwgId
      this.shapes = [...shapes, ...markers]
    }
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
