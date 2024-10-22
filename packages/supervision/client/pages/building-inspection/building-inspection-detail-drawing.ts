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
import { Shape } from '@operato/image-marker'

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

      dialog ox-image-marker-view {
        width: 80vw;
        height: 80vh;
      }
    `
  ]

  @state() project: any = {}
  @state() buildingInspection: any = {}
  @state() buildingInspectionId: string = ''
  @state() imageUrl?: string
  @state() shapes: Shape[] = []
  @state() linkUrl?: string
  @state() linkShapes: Shape[] = []

  @state() drawingImageProvider: DrawingImageProvider = new DrawingImageProvider()
  // @consume({ context: OxUserPreferencesContext, subscribe: true })

  @query('#image-marker') imageMarker!: any
  @query('#link-viewer') linkViewer!: any
  @query('dialog') dialog!: HTMLDialogElement

  get context() {
    return {
      title: '검측 관리 상세 - 검측 도면'
    }
  }

  connectedCallback(): void {
    super.connectedCallback()

    requestAnimationFrame(() => {
      this.imageMarker.setImageProvider(this.drawingImageProvider)
      this.linkViewer.setImageProvider(this.drawingImageProvider)

      this.dialog.addEventListener('click', event => {
        const rect = this.dialog.getBoundingClientRect()
        const isInDialog =
          rect.top <= event.clientY && event.clientY <= rect.bottom && rect.left <= event.clientX && event.clientX <= rect.right

        // 다이아로그 내부를 클릭한 것이 아니면 다이아로그 닫기
        if (!isInDialog) {
          this.dialog.close()
        }
      })
    })
  }

  disconnectedCallback(): void {
    this.imageMarker?.setImageProvider(null)
    this.linkViewer?.setImageProvider(null)

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

      <div
        body
        @link-clicked=${async (e: CustomEvent) => {
          this.linkViewer.reset()

          const { link } = e.detail
          const { id, type, symbol, box, dwgId } = JSON.parse(link)
          const [x, y, width, height] = box?.split(',').map(Number) || []

          this.linkUrl = dwgId
          this.linkShapes = [
            {
              id: id!,
              type: 'link',
              x,
              y,
              width,
              height,
              link: '{}'
            }
          ]

          if (this.dialog) {
            this.dialog.showModal()
          }
        }}
      >
        ${this.buildingInspection?.status == BuildingInspectionStatus.PASS
          ? html`<ox-image-marker-view
              id="image-marker"
              .imageUrl=${this.imageUrl}
              .shapes=${this.shapes}
            ></ox-image-marker-view>`
          : html` <ox-image-marker
              id="image-marker"
              .imageUrl=${this.imageUrl}
              .shapes=${this.shapes}
              @shapes-changed=${this.onClickMarkerSave}
              .currentMode=${'view'}
            ></ox-image-marker>`}
      </div>

      <dialog>
        <ox-image-marker-view id="link-viewer" .imageUrl=${this.linkUrl} .shapes=${this.linkShapes}></ox-image-marker-view>
      </dialog>
    `
  }

  protected async updated(changes: PropertyValues): Promise<void> {
    if (changes.has('buildingInspection')) {
      // TODO 위치 및 도면정보 가져올 수 있어야 하고, (이미 가지고 있다면) pdf 파일 filepath 가져올 수 있으면 됨.
      // const filename = this.buildingInspection?.buildingLevel?.mainDrawingImage || '/assets/images/img-drawing-default.png'

      // 1-1. 위치 정보 - 체크리스트에 들어가는 위치정보 텍스트
      const location_1 = this.buildingInspection.checklist.location

      // 1-2. 위치 정보 - 실제 위치정보 텍스트 (동 + 층) - ID 필드를 사용하면 DB ID 필드입니다.
      const location_building = this.buildingInspection.buildingLevel.building.name
      const location_floor = this.buildingInspection.buildingLevel.floor

      // 2. 평면도 pdf 파일
      // mainDrawing {
      //   id
      //   name
      //   fullpath
      // }
      const mainDrawing = this.buildingInspection.buildingLevel.mainDrawing

      const dwgId = 'GA-3006'

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

      this.imageMarker.reset()
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
            checklist {
              location
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
