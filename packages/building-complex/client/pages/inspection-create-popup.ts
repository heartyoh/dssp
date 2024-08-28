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

  @state() checklistTemplates: any = []

  @query('md-filled-select[building]') htmlSelectBuilding
  @query('md-filled-select[level]') htmlSelectLevel
  @query('md-filled-select[constructionType]') htmlSelectConstructionType
  @query('md-filled-select[constructionDetailType]') htmlSelectConstructionDetailType
  @query('md-filled-select[checklistTemplate]') htmlSelectChecklistTemplate

  render() {
    return html`
      <div body>
        <div select>
          <md-filled-select label="공종" constructionType @change=${this._onSelectConstructionType}>
            ${this.constructionTypes?.map(constructionType => {
              const selected = constructionType.id === this.selectedConstructionType?.id
              return html`<md-select-option ?selected=${selected} .value=${constructionType.id}>
                <div slot="headline">${constructionType.name}</div>
              </md-select-option>`
            })}
          </md-filled-select>

          <md-filled-select label="세부 공종" constructionDetailType @change=${this._onSelectConstructionDetailType}>
            ${this.selectedConstructionType?.constructionDetailTypes?.map(constructionDetailType => {
              const selected = constructionDetailType.id === this.selectedConstructionDetailType.id
              return html`<md-select-option ?selected=${selected} .value=${constructionDetailType.id}>
                <div slot="headline">${constructionDetailType.name}</div>
              </md-select-option>`
            })}
          </md-filled-select>
        </div>

        <div select>
          <md-filled-select label="동" building @change=${this._onSelectBuilding}>
            ${this.buildings?.map(building => {
              return html` <md-select-option .value=${building.id}>
                <div slot="headline">${building.name}</div>
              </md-select-option>`
            })}
          </md-filled-select>

          <md-filled-select label="층" level @change=${this._onSelectBuildingLevel}>
            ${this.selectedBuilding?.buildingLevels?.map(level => {
              return html`<md-select-option .value=${level.id}>
                <div slot="headline">${level.floor}</div>
              </md-select-option>`
            })}
          </md-filled-select>
        </div>

        <div select>
          <md-filled-select label="체크리스트" checklistTemplate>
            ${this.checklistTemplates?.map((checklistTemplate, idx) => {
              return html` <md-select-option .value=${checklistTemplate.id}>
                <div slot="headline">${checklistTemplate.name}</div>
              </md-select-option>`
            })}
          </md-filled-select>
        </div>

        <div button-container>
          <md-elevated-button @click=${this._createInspection}>
            <md-icon slot="icon">add</md-icon>검측 요청서 등록
          </md-elevated-button>
        </div>
      </div>
    `
  }

  async firstUpdated() {
    console.log('this.projectId :', this.projectId)
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

          checklistTemplates {
            items {
              id
              name
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
    const checklistTemplates = response.data?.checklistTemplates?.items || []

    this.buildings = [...(project?.buildingComplex?.buildings || [])]
    this.constructionTypes = [...constructionTypes]
    this.checklistTemplates = [...checklistTemplates]

    // 첫번째 빌딩 선택
    this.selectedBuilding = project?.buildingComplex?.buildings?.[0]
    this.selectedConstructionType = constructionTypes?.[0]

    // 선택된 동의 층 리스트 가져오기
    this.selectedBuilding = await this._getBuilding(this.selectedBuilding.id)
    this.selectedConstructionType = await this._getConstructionType(this.selectedConstructionType.id)

    // levelId 파라미터가 있으면 선택된 층, 없으면 첫번째 층 선택
    this.selectedLevel = this.selectedBuilding?.buildingLevels?.[0]
    this.selectedConstructionDetailType = this.selectedConstructionType?.constructionDetailTypes?.[0]

    // 동, 층이 랜더링 된 후에 select를 위해 이 시점에서 랜더링
    this.selectedBuilding = await { ...this.selectedBuilding }
    this.selectedConstructionType = await { ...this.selectedConstructionType }

    // 기본 값 셋팅 select
    await this.htmlSelectBuilding.select(this.selectedBuilding.id)
    await this.htmlSelectLevel.select(this.selectedLevel.id)
    await this.htmlSelectConstructionType.select(this.selectedConstructionType.id)
    await this.htmlSelectConstructionDetailType.select(this.selectedConstructionDetailType.id)
    await this.htmlSelectChecklistTemplate.selectIndex(0)
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

  async _getConstructionType(id: string = '') {
    const response = await client.query({
      query: gql`
        query ConstructionType($id: String!) {
          constructionType(id: $id) {
            id
            name
            description
            constructionDetailTypes {
              id
              name
            }
          }
        }
      `,
      variables: { id }
    })

    if (response.errors) return

    return response.data?.constructionType || {}
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
      notify({ message: '검측 요청서를 등록하였습니다.' })
      this.requestRefresh()
    } else {
      notify({ message: '검측 요청서 등록에 실패하였습니다.', level: 'error' })
    }
  }

  private async _onSelectBuilding(e) {
    const buildingId = e.target.value
    this.selectedBuilding = await this._getBuilding(buildingId)
    this.selectedLevel = await { ...this.selectedBuilding?.buildingLevels?.[0] }

    await this.htmlSelectLevel.selectIndex(0)
  }

  private _onSelectBuildingLevel(e) {
    const buildingLevelId = e.target.value
    this.selectedLevel = {
      ...(this.selectedBuilding?.buildingLevels?.find(v => v.id == buildingLevelId) || {})
    }
  }

  private async _onSelectConstructionType(e) {
    const constructionTypeId = e.target.value
    this.selectedConstructionType = await this._getConstructionType(constructionTypeId)
    this.selectedConstructionDetailType = await { ...this.selectedConstructionType?.constructionDetailTypes?.[0] }

    await this.htmlSelectConstructionDetailType.selectIndex(0)
  }

  private _onSelectConstructionDetailType(e) {
    const constructionDetailTypeId = e.target.value
    this.selectedConstructionDetailType = {
      ...(this.selectedConstructionType?.constructionDetailTypes?.find(v => v.id == constructionDetailTypeId) || {})
    }
  }

  requestRefresh() {
    this.dispatchEvent(new CustomEvent('requestRefresh'))
  }

  private _close() {
    history.back()
  }
}
