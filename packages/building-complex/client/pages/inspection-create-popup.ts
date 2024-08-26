import '@material/web/icon/icon.js'

import gql from 'graphql-tag'
import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

import { client } from '@operato/graphql'
import { ButtonContainerStyles } from '@operato/styles'
import { notify } from '@operato/layout'

@customElement('inspection-create-popup')
class InspectionCreatePopup extends LitElement {
  static styles = [
    ButtonContainerStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;

        background-color: var(--md-sys-color-surface);
      }

      ox-grist {
        flex: 1;
      }

      md-filled-select {
        width: auto;
        min-width: 150px;
        --md-filled-select-text-field-container-color: transparent;
        --md-filled-select-text-field-active-indicator-color: #999;
        --md-filled-select-text-field-input-text-size: 14px;
        --md-filled-select-text-field-input-text-weight: bold;
        --md-filled-select-text-field-input-text-line-height: 6px;
      }
      md-filled-select[level] {
        min-width: 110px;
        margin-left: 20px;
      }
    `
  ]

  @property({ type: String }) projectId: string = ''
  @state() buildings: any = []
  @state() selectedBuilding: any = {}
  @state() selectedLevel: any = {}

  @state() constructionTypes: any = []
  @state() selectedConstructionType: any = {}
  @state() selectedConstructionDetailType: any = {}

  @query('md-filled-select[building]') htmlSelectBuilding
  @query('md-filled-select[level]') htmlSelectLevel
  @query('md-filled-select[constructionType]') htmlSelectConstructionType
  @query('md-filled-select[constructionDetailType]') htmlSelectConstructionDetailType

  render() {
    return html`
      <div body>
        <div select>
          <div>
            <md-filled-select label="공종" constructionType @change=${this._onSelectBuilding}>
              ${this.constructionTypes?.map(constructionType => {
                const selected = constructionType.id === this.selectedConstructionType?.id
                return html`<md-select-option ?selected=${selected} .value=${constructionType.id}>
                  <div slot="headline">${constructionType.name}</div>
                </md-select-option>`
              })}
            </md-filled-select>

            <md-filled-select label="세부 공종" constructionDetailType @change=${this._onSelectBuildingLevel}>
              ${this.selectedConstructionType?.constructionDetailTypes?.map(constructionDetailType => {
                const selected = constructionDetailType.id === this.selectedConstructionDetailType.id
                return html`<md-select-option ?selected=${selected} .value=${constructionDetailType.id}>
                  <div slot="headline">${constructionDetailType.name}</div>
                </md-select-option>`
              })}
            </md-filled-select>
          </div>
        </div>

        <div select>
          <div>
            <md-filled-select label="동" building @change=${this._onSelectBuilding}>
              ${this.buildings?.map(building => {
                const selected = building.id === this.selectedBuilding?.id
                return html` <md-select-option ?selected=${selected} .value=${building.id}>
                  <div slot="headline">${building.name}</div>
                </md-select-option>`
              })}
            </md-filled-select>

            <md-filled-select label="층" level @change=${this._onSelectBuildingLevel}>
              ${this.selectedBuilding?.buildingLevels?.map(level => {
                const selected = level.id === this.selectedLevel.id
                return html`<md-select-option ?selected=${selected} .value=${level.id}>
                  <div slot="headline">${level.floor}</div>
                </md-select-option>`
              })}
            </md-filled-select>
          </div>
        </div>

        <div button-container>
          <md-elevated-button @click=${this._createInspection}>
            <md-icon slot="icon">add</md-icon>프로젝트 생성
          </md-elevated-button>
        </div>
      </div>
    `
  }

  async firstUpdated() {
    const response = await client.query({
      query: gql`
        query Project($id: String!) {
          project(id: $id) {
            id
            name
            buildingComplex {
              id
              buildings {
                id
                name
              }
            }
          }

          constructionTypes {
            items {
              name
              id
            }
          }
        }
      `,
      variables: {
        id: this.projectId
      }
    })

    if (response.errors) return

    const project = response.data?.project
    const constructionTypes = response.data?.constructionTypes?.items || []

    this.buildings = [...(project?.buildingComplex?.buildings || [])]
    this.constructionTypes = [...constructionTypes]

    // 첫번째 빌딩 선택
    this.selectedBuilding = project?.buildingComplex?.buildings?.[0]
    this.selectedConstructionType = constructionTypes?.[0]

    // 선택된 동의 층 리스트 가져오기
    this.selectedBuilding = await this._getBuilding(this.selectedBuilding.id)
    this.selectedConstructionType = await this._getConstructionType(this.selectedConstructionType.id)

    // levelId 파라미터가 있으면 선택된 층, 없으면 첫번째 층 선택
    this.selectedLevel = this.selectedBuilding?.buildingLevels?.[0]
    this.selectedConstructionDetailType = this.selectedConstructionType?.detailType?.[0]

    // 동, 층이 랜더링 된 후에 select를 위해 이 시점에서 랜더링
    this.selectedBuilding = await { ...this.selectedBuilding }
    this.selectedConstructionType = await { ...this.selectedConstructionType }

    console.log(111, this.htmlSelectConstructionType)
    console.log(222, this.selectedConstructionType.id)

    // 기본 값 셋팅 select
    await this.htmlSelectBuilding.select(this.selectedBuilding.id)
    await this.htmlSelectLevel.select(this.selectedLevel.id)
    await this.htmlSelectConstructionType.select(this.selectedConstructionType.id)
    // await this.htmlSelectConstructionDetailType.select(this.selectedConstructionDetailType.id)
  }

  async _getBuilding(buildingId: string = '') {
    const response = await client.query({
      query: gql`
        query Building($id: String!) {
          building(id: $id) {
            id
            name
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
              mainDrawingImage
            }
          }
        }
      `,
      variables: {
        id: buildingId
      }
    })

    if (response.errors) return

    return response.data?.building || {}
  }

  async _getConstructionType(buildingId: string = '') {
    return []
  }

  async _createInspection() {
    const patches = {}

    const response = await client.mutate({
      mutation: gql`
        mutation UpdateMultipleChecklistTemplateItems($checklistTemplateId: String!, $patches: [ChecklistTemplateItemPatch!]!) {
          updateMultipleChecklistTemplateItems(checklistTemplateId: $checklistTemplateId, patches: $patches) {
            id
          }
        }
      `,
      variables: {
        patches
      }
    })

    if (!response.errors) {
      notify({ message: '저장되었습니다.' })
      this.requestRefresh()
    } else {
      notify({ message: '저장에 실패하였습니다.', level: 'error' })
    }
  }

  private async _onSelectBuilding(e) {
    const buildingId = e.target.value
    this.selectedBuilding = await this._getBuilding(buildingId)
    this.selectedLevel = { ...this.selectedBuilding?.buildingLevels?.[0] }
  }

  private _onSelectBuildingLevel(e) {
    const buildingLevelId = e.target.value
    this.selectedLevel = {
      ...(this.selectedBuilding?.buildingLevels?.find(v => v.id == buildingLevelId) || {})
    }
  }

  requestRefresh() {
    this.dispatchEvent(new CustomEvent('requestRefresh'))
  }

  private _close() {
    history.back()
  }
}
