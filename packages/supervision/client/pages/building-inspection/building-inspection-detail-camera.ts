import '@material/web/icon/icon.js'
import '@operato/input/ox-input-switch.js'
import '@operato/mini-map/ox-zoomable-image.js'

import gql from 'graphql-tag'
import { css, html, PropertyValues } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { PageView } from '@operato/shell'
import { CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { client } from '@operato/graphql'

import './component/building-inspection-detail-header'

@customElement('building-inspection-detail-camera')
export class BuildingInspectionCamera extends PageView {
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
      }

      div[body] {
        display: flex;
        justify-items: center;
        gap: var(--spacing-medium);
        margin: var(--spacing-medium);
      }

      div[preview] {
        flex: 1;
        border: 2px solid #ddd;
        border-radius: 10px;

        display: flex;
        justify-content: center;
        align-items: center;
      }

      div[preview] img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      div[preview] md-icon {
        --md-icon-size: 160px;
      }

      div[controls] {
        width: 240px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }

      div[action-buttons] {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      .switch-container {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 24px;
        font-weight: bold;
      }

      ox-input-switch {
        --ox-simple-switch-fullwidth: 68px;
        --ox-simple-switch-fullheight: 34px;
        --ox-simple-switch-thumbnail-size: 34px;
      }

      .camera-shutter {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        position: relative;
      }

      .camera-shutter md-icon {
        --md-icon-size: 100px;
      }

      .camera-shutter input {
        opacity: 0;
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        cursor: pointer;
      }

      button {
        padding: 10px 20px;
        font-size: 16px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
      }

      button.save {
        background-color: #4caf50;
        color: white;
      }

      button.retry {
        background-color: #f0ad4e;
        color: white;
      }

      button.cancel {
        background-color: #d9534f;
        color: white;
      }
    `
  ]

  @state() project: any = {}
  @state() buildingInspection: any = {}
  @state() buildingInspectionId: string = ''
  @state() capturedImage: string | null = null // For storing the captured image
  @state() originImage: string | null = null

  get context() {
    return {
      title: '검측 관리 상세 - 사진 촬영'
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
        <!-- Display the captured image if available -->
        <div preview>
          ${this.capturedImage
            ? html`<ox-zoomable-image src=${this.capturedImage} restrict-boundary></ox-zoomable-image>`
            : html`<md-icon>photo_camera</md-icon>`}
        </div>

        <div controls>
          <!-- AI toggle switch -->
          <div class="switch-container">
            <label>AI 기능</label>
            <ox-input-switch type="checkbox" @change=${this.toggleAI} round></ox-input-switch>
          </div>

          <!-- Camera shutter button -->
          <div class="camera-shutter">
            <md-icon>camera</md-icon>
            <input type="file" accept="image/*" capture @change="${this.handleImageCapture}" />
          </div>

          <!-- Action buttons -->
          <div class="action-buttons">
            <button class="save">저장</button>
            <button class="retry">재촬영</button>
            <button class="cancel" @click=${() => (this.capturedImage = this.originImage)}>취소</button>
          </div>
        </div>
      </div>
    `
  }

  protected async updated(changes: PropertyValues): Promise<void> {}

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
            checklist {
              location
              inspectionDrawingType
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

  private toggleAI(e: Event) {
    const isChecked = (e.target as HTMLInputElement).checked
    console.log(`AI 기능: ${isChecked ? 'ON' : 'OFF'}`)
    // Implement additional AI functionality toggling if needed
  }

  private handleImageCapture(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const reader = new FileReader()
      reader.onload = e => {
        this.capturedImage = e.target?.result as string
      }
      reader.readAsDataURL(input.files[0])
    }
  }
}
