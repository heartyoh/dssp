import '@material/web/icon/icon.js'
import '@operato/data-grist/ox-grist.js'

import gql from 'graphql-tag'
import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { DataGrist } from '@operato/data-grist/ox-grist.js'
import { client } from '@operato/graphql'
import { ButtonContainerStyles, ScrollbarStyles } from '@operato/styles'
import { notify } from '@operato/layout'
import { BuildingInspectionStatus, CHECKLIST_MAIN_TYPE_LIST } from './building-inspection-list'
import '../checklist/checklist-view'
import { ChecklistMode } from '../checklist/checklist-view'

@customElement('inspection-create-popup')
class InspectionCreatePopup extends LitElement {
  static styles = [
    ButtonContainerStyles,
    ScrollbarStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        padding: 15px 20px;

        background-color: var(--md-sys-color-surface);
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

      checklist-view {
        pointer-events: none;
        transform-origin: top left;
      }

      div[body] {
        height: 100%;
        overflow-y: auto;

        div[tab-container][inactive] {
          display: none !important;
        }

        div[edit] {
          width: 100%;

          div[detail] {
            margin-bottom: 30px;
          }

          h3 {
            position: relative;
            color: #0595e5;
            font-size: 17px;
            font-weight: 700;
            background-color: var(--md-sys-color-surface);
            margin-top: 0;
            margin-bottom: 5px;
          }

          div[data-row] {
            display: grid;
            grid-template-columns: 100px 1fr 0.3fr 100px 1fr;
            gap: 15px;
            margin-bottom: 11px;

            & > label {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              font-size: 15px;
            }

            div[inspection-parts] {
              display: block;
              margin-top: 7px;

              & > span {
                display: inline-block;
                margin-right: 5px;
                margin-bottom: 5px;

                & > md-checkbox {
                  margin-top: 2px;
                }
              }
            }
          }
        }

        div[preview] {
          display: flex;
          overflow-y: auto;
          overflow-x: hidden;
        }
      }

      div[tabs] {
        display: flex;

        button {
          background-color: #fff;
          padding: 6px 14px;
          color: #999;
          border: solid 1px #999;
          border-top: none;
          border-radius: 0px 0px 8px 8px;
          margin-right: -2px;
          cursor: pointer;

          &[active] {
            color: var(--button-color, var(--md-sys-color-on-secondary-container));
            font-weight: 600;
          }
        }
      }

      div[button-container] {
        display: flex;
        justify-content: flex-end;
        gap: 10px;

        md-elevated-button[blue] {
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
    `
  ]

  @property({ type: Object }) gristConfig: any
  @property({ type: Object }) checklistDetailTypes: any
  @property({ type: String }) projectId: string = ''
  @property({ type: String }) checklistTemplateId: string = ''
  @property({ type: String }) selectedBuildingId: string = ''
  @property({ type: String }) selectedBuildingLevelId: string = ''

  @state() buildings: any = []
  @state() selectedBuilding: any = {}
  @state() selectedLevel: any = {}

  @state() constructionTypes: any = []
  @state() selectedConstructionType: any = {}
  @state() selectedConstructionDetailType: any = {}

  @state() inspectionDrawingTypes: any = []
  @state() selectedInspectionDrawingType: any = {}
  @state() selectedInspectionParts: Array<string> = []

  @state() checklistTemplates: any = []
  @state() checklist: any = {}

  @state() activeTab: 'edit' | 'preview' = 'edit'

  @query('md-filled-select[building]') htmlSelectBuilding
  @query('md-filled-select[level]') htmlSelectLevel
  @query('md-filled-select[constructionType]') htmlSelectConstructionType
  @query('md-filled-select[constructionDetailType]') htmlSelectConstructionDetailType
  @query('md-filled-select[inspectionDrawingType]') htmlSelectInspectionDrawingType
  @query('md-filled-select[inspectionPart]') htmlSelectInspectionPart
  @query('md-filled-select[checklistTemplate]') htmlSelectChecklistTemplate
  @query('ox-grist') grist!: DataGrist
  @query('div[preview]') checklistViewContainer!: HTMLDivElement
  @query('checklist-view') checklistView!: HTMLElement

  render() {
    return html`
      <div body>
        <div tab-container ?inactive=${this.activeTab !== 'edit'} edit>
          <div detail>
            <h3>세부 정보</h3>

            <div data-row>
              <label>공종</label>
              <md-filled-select constructionType @change=${this._onSelectConstructionType}>
                ${this.constructionTypes?.map(constructionType => {
                  const selected = constructionType.id === this.selectedConstructionType?.id
                  return html`<md-select-option ?selected=${selected} .value=${constructionType.id}>
                    <div slot="headline">${constructionType.name}</div>
                  </md-select-option>`
                })}
              </md-filled-select>

              <div partition></div>

              <label>세부 공종</label>
              <md-filled-select constructionDetailType @change=${this._onSelectConstructionDetailType}>
                ${this.selectedConstructionType?.constructionDetailTypes?.map(constructionDetailType => {
                  const selected = constructionDetailType.id === this.selectedConstructionDetailType.id
                  return html`<md-select-option ?selected=${selected} .value=${constructionDetailType.id}>
                    <div slot="headline">${constructionDetailType.name}</div>
                  </md-select-option>`
                })}
              </md-filled-select>
            </div>

            <div data-row>
              <label>동</label>
              <md-filled-select building @change=${this._onSelectBuilding}>
                ${this.buildings?.map(building => {
                  return html` <md-select-option .value=${building.id}>
                    <div slot="headline">${building.name}</div>
                  </md-select-option>`
                })}
              </md-filled-select>

              <div partition></div>

              <label>층</label>
              <md-filled-select level @change=${this._onSelectBuildingLevel}>
                ${this.selectedBuilding?.buildingLevels?.map(level => {
                  return html`<md-select-option .value=${level.id}>
                    <div slot="headline">${level.floor}</div>
                  </md-select-option>`
                })}
              </md-filled-select>
            </div>

            <div data-row>
              <label>검측 도면</label>
              <md-filled-select inspectionDrawingType @change=${this._onSelectInspectionDrawingType}>
                ${this.inspectionDrawingTypes?.map(inspectionDrawingType => {
                  return html` <md-select-option .value=${inspectionDrawingType.id}>
                    <div slot="headline">${inspectionDrawingType.name}</div>
                  </md-select-option>`
                })}
              </md-filled-select>

              <div partition></div>

              <label>검측 부위</label>
              <div inspection-parts>
                ${this.selectedInspectionDrawingType?.inspectionParts?.map(inspectionPart => {
                  return html`
                    <span>
                      <md-checkbox
                        id=${'check_' + inspectionPart.id}
                        ?checked="${this.isSelected(inspectionPart)}"
                        @click=${() => this._onSelectInspectionPart(inspectionPart)}
                      ></md-checkbox>
                      <label>${inspectionPart.name}</label>
                    </span>
                  `
                })}
              </div>
            </div>
          </div>

          <div checklist>
            <h3>체크리스트</h3>

            <div data-row>
              <label>이름</label>
              <md-filled-text-field
                name="checklistName"
                type="text"
                .value=${this.checklist?.name || ''}
                @input=${this._onInputChange}
              >
              </md-filled-text-field>

              <div partition></div>

              <label>템플릿</label>
              <md-filled-select checklistTemplate @change=${this._onSelectChecklistTemplate}>
                <md-select-option></md-select-option>
                ${this.checklistTemplates?.map((checklistTemplate, idx) => {
                  return html` <md-select-option .value=${checklistTemplate.id}>
                    <div slot="headline">${checklistTemplate.name}</div>
                  </md-select-option>`
                })}
              </md-filled-select>
            </div>
          </div>

          <ox-grist
            .mode=${'GRID'}
            .config=${this.gristConfig}
            .fetchHandler=${this.fetchHandler.bind(this)}
            @field-change=${this.onChangeGird}
          >
          </ox-grist>
        </div>

        <div tab-container ?inactive=${this.activeTab !== 'preview'} preview>
          <checklist-view .mode=${ChecklistMode.VIEWER} .checklist=${this.checklist}></checklist-view>
        </div>
      </div>

      <div tabs>
        <button ?active=${this.activeTab === 'edit'} @click=${() => (this.activeTab = 'edit')}>검측 요청 정보</button>
        <button ?active=${this.activeTab === 'preview'} @click=${() => (this.activeTab = 'preview')}>미리보기</button>
      </div>

      <div button-container>
        <md-elevated-button blue @click=${this._createInspection}>
          <md-icon slot="icon">task</md-icon>검측 요청서 등록
        </md-elevated-button>
        <md-elevated-button @click=${this._close}> <md-icon slot="icon">cancel</md-icon>취소</md-elevated-button>
      </div>
    `
  }

  updated() {
    const ratio = Math.round((this.checklistViewContainer?.offsetWidth / this.checklistView?.offsetWidth) * 100) / 100 || 1
    this.checklistView.style.transform = `scale(${ratio})`
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

          inspectionDrawingTypes {
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

          checklistTypes {
            items {
              id
              mainType
              detailType
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
    const inspectionDrawingTypes = response.data?.inspectionDrawingTypes?.items || []
    const checklistTemplates = response.data?.checklistTemplates?.items || []
    this.checklistDetailTypes = response.data.checklistTypes?.items?.map(v => {
      return {
        display: v.detailType,
        value: v.id,
        mainType: v.mainType
      }
    })

    this.buildings = [...(project?.buildingComplex?.buildings || [])]
    this.constructionTypes = [...constructionTypes]
    this.inspectionDrawingTypes = [...inspectionDrawingTypes]
    this.checklistTemplates = [...checklistTemplates]

    // selectedBuildingId가 있으면 해당 빌딩 선택, 없으면 첫번째 빌딩 선택
    this.selectedBuilding = this.selectedBuildingId
      ? this.buildings.find(building => building.id == this.selectedBuildingId)
      : this.buildings[0]

    this.selectedConstructionType = constructionTypes?.[0]
    this.selectedInspectionDrawingType = inspectionDrawingTypes?.[0]

    // 선택된 동의 층 리스트 가져오기
    this.selectedBuilding = await this._getBuilding(this.selectedBuilding.id)
    this.selectedConstructionType = await this._getConstructionType(this.selectedConstructionType.id)
    this.selectedInspectionDrawingType = await this._getInspectionDrawingType(this.selectedInspectionDrawingType.id)

    // selectedBuildingLevelId가 있으면 선택된 층, 없으면 첫번째 층 선택
    this.selectedLevel = this.selectedBuildingLevelId
      ? this.selectedBuilding?.buildingLevels?.find(level => level.id == this.selectedBuildingLevelId)
      : this.selectedBuilding?.buildingLevels?.[0]

    this.selectedConstructionDetailType = this.selectedConstructionType?.constructionDetailTypes?.[0]
    this.selectedInspectionParts = []

    // 동, 층이 랜더링 된 후에 select를 위해 이 시점에서 랜더링
    this.selectedBuilding = await { ...this.selectedBuilding }
    this.selectedConstructionType = await { ...this.selectedConstructionType }

    // 기본 값 셋팅 select
    await this.htmlSelectBuilding.select(this.selectedBuilding.id)
    await this.htmlSelectLevel.select(this.selectedLevel.id)
    await this.htmlSelectConstructionType.select(this.selectedConstructionType.id)
    await this.htmlSelectConstructionDetailType.select(this.selectedConstructionDetailType.id)
    await this.htmlSelectInspectionDrawingType.select(this.selectedInspectionDrawingType.id)
    await this.htmlSelectChecklistTemplate.selectIndex(0)

    this.checklist = {
      constructionType: this.selectedConstructionType?.name,
      constructionDetailType: this.selectedConstructionDetailType?.name,
      location: `${this.selectedBuilding?.name || ''} ${this.selectedLevel.floor || ''}층`,
      documentNo: '0000-000-000000',
      buildingInspection: {
        status: BuildingInspectionStatus.WAIT
      }
    }

    // 그리드 셋팅
    this.setGristConfig()
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

  async _getInspectionDrawingType(id: string = '') {
    const response = await client.query({
      query: gql`
        query InspectionDrawingType($id: String!) {
          inspectionDrawingType(id: $id) {
            id
            name
            inspectionParts {
              id
              name
            }
          }
        }
      `,
      variables: { id }
    })

    if (response.errors) return

    return response.data?.inspectionDrawingType || {}
  }

  private async _onSelectBuilding(e) {
    const buildingId = e.target.value
    this.selectedBuilding = await this._getBuilding(buildingId)
    this.selectedLevel = await { ...this.selectedBuilding?.buildingLevels?.[0] }
    this.checklist = { ...this.checklist, location: `${this.selectedBuilding?.name || ''} ${this.selectedLevel.floor || ''}층` }

    await this.htmlSelectLevel.selectIndex(0)
  }

  private _onSelectBuildingLevel(e) {
    const buildingLevelId = e.target.value
    this.selectedLevel = {
      ...(this.selectedBuilding?.buildingLevels?.find(v => v.id == buildingLevelId) || {})
    }
    this.checklist = { ...this.checklist, location: `${this.selectedBuilding?.name || ''} ${this.selectedLevel.floor || ''}층` }
  }

  private async _onSelectConstructionType(e) {
    const constructionTypeId = e.target.value
    this.selectedConstructionType = await this._getConstructionType(constructionTypeId)
    this.selectedConstructionDetailType = await { ...this.selectedConstructionType?.constructionDetailTypes?.[0] }
    this.checklist = {
      ...this.checklist,
      constructionType: this.selectedConstructionType?.name,
      constructionDetailType: this.selectedConstructionDetailType?.name
    }

    await this.htmlSelectConstructionDetailType.selectIndex(0)
  }

  private _onSelectConstructionDetailType(e) {
    const constructionDetailTypeId = e.target.value
    this.selectedConstructionDetailType = {
      ...(this.selectedConstructionType?.constructionDetailTypes?.find(v => v.id == constructionDetailTypeId) || {})
    }
    this.checklist = {
      ...this.checklist,
      constructionType: this.selectedConstructionType?.name,
      constructionDetailType: this.selectedConstructionDetailType?.name
    }
  }

  private async _onSelectInspectionDrawingType(e) {
    const inspectionDrawingTypeId = e.target.value
    this.selectedInspectionDrawingType = await this._getInspectionDrawingType(inspectionDrawingTypeId)
    this.selectedInspectionParts = []
    this.checklist = {
      ...this.checklist,
      inspectionParts: this.selectedInspectionParts
    }
  }

  private async _onSelectInspectionPart(part) {
    if (this.selectedInspectionParts.includes(part.name)) {
      this.selectedInspectionParts = this.selectedInspectionParts.filter(item => item !== part.name)
    } else {
      this.selectedInspectionParts.push(part.name)
    }

    this.selectedInspectionParts = [...this.selectedInspectionParts]
    this.checklist = {
      ...this.checklist,
      inspectionParts: this.selectedInspectionParts
    }
  }

  isSelected(option: any): boolean {
    return this.selectedInspectionParts.includes(option.name)
  }

  requestRefresh() {
    this.dispatchEvent(new CustomEvent('requestRefresh'))
  }

  private _close() {
    history.back()
  }

  setGristConfig() {
    this.gristConfig = {
      columns: [
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'gutter',
          gutterName: 'button',
          icon: 'arrow_upward',
          handlers: {
            click: 'move-up'
          }
        },
        {
          type: 'gutter',
          gutterName: 'button',
          icon: 'arrow_downward',
          handlers: {
            click: 'move-down'
          }
        },
        {
          type: 'select',
          name: 'mainType',
          header: '구분',
          record: {
            editable: true,
            options: [{ display: '', value: '' }].concat(
              Object.keys(CHECKLIST_MAIN_TYPE_LIST).map(key => ({ display: CHECKLIST_MAIN_TYPE_LIST[key], value: key }))
            )
          },
          width: 100
        },
        {
          type: 'select',
          name: 'detailType',
          header: '상세 구분',
          record: {
            editable: true,
            options: (columns, data, column) => [
              { display: '', value: '' },
              ...this.checklistDetailTypes.filter(v => v.mainType == column.mainType)
            ]
          },
          width: 200
        },
        {
          type: 'string',
          name: 'name',
          header: '검사 항목',
          record: {
            editable: true
          },
          width: 200
        },
        {
          type: 'string',
          name: 'inspctionCriteria',
          header: '검사 기준',
          record: {
            editable: true
          },
          width: 200
        }
      ],
      pagination: {
        infinite: true
      },
      sorters: [{ name: 'mainType' }, { name: 'sequence' }]
    }
  }

  async fetchHandler() {
    if (!this.checklistTemplateId) return []

    const response = await client.query({
      query: gql`
        query ($filters: [Filter!], $pagination: Pagination, $sortings: [Sorting!]) {
          checklistTemplateItems(filters: $filters, pagination: $pagination, sortings: $sortings) {
            items {
              id
              sequence
              name
              inspctionCriteria
              mainType
              detailType
            }
          }
        }
      `,
      variables: {
        filters: {
          name: 'checklistTemplateId',
          value: this.checklistTemplateId,
          operator: 'eq'
        },
        sortings: [{ name: 'mainType' }, { name: 'sequence' }]
      }
    })

    // 체크리스트 아이템 데이터 갱신
    this.onChangeGird()

    return {
      records: response.data.checklistTemplateItems.items || []
    }
  }

  private _onSelectChecklistTemplate(e) {
    const checklistTemplateId = e.target.value

    // 체크 리스트 이름 셋팅
    this.checklist = { ...this.checklist, name: e.target.displayText }

    // 그리드 아이템 셋팅
    if (checklistTemplateId) {
      this.checklistTemplateId = checklistTemplateId
      this.grist.fetch()
    }
  }

  async _createInspection() {
    let patch: any = {}

    patch.buildingLevelId = this.htmlSelectLevel.value
    patch.checklist = {
      name: this.checklist.name,
      constructionType: this.htmlSelectConstructionType.displayText,
      constructionDetailType: this.htmlSelectConstructionDetailType.displayText,
      location: `${this.htmlSelectBuilding.displayText} ${this.htmlSelectLevel.displayText}층`,
      inspectionDrawingType: this.selectedInspectionDrawingType.name,
      inspectionParts: this.checklist.inspectionParts
    }
    patch.checklistItem = this.checklist.checklistItems?.map(item => {
      return {
        name: item.name,
        mainType: item.mainType,
        detailType: item.detailType,
        inspctionCriteria: item.inspctionCriteria
      }
    })

    const response = await client.mutate({
      mutation: gql`
        mutation CreateBuildingInspection($patch: NewBuildingInspection!) {
          createBuildingInspection(patch: $patch) {
            id
          }
        }
      `,
      variables: {
        patch
      }
    })

    if (!response.errors) {
      notify({ message: '검측 요청서를 등록하였습니다.' })
      this.requestRefresh()
      this._close()
    } else {
      notify({ message: response.errors?.[0]?.message || '검측 요청서 등록에 실패하였습니다.', level: 'error' })
    }
  }
  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent) {
    const target = event.target as HTMLInputElement
    this[target.name] = target.value
    this.checklist = { ...this.checklist, name: target.value }
  }

  // 체크리스트 아이템 데이터 갱신
  private onChangeGird() {
    const checklistDetailTypes = Object.fromEntries(this.checklistDetailTypes.map(item => [item.value, item.display]))
    const grist = this.grist

    // grist field-change가 오는 시점이 데이터 변경 전이라 setTimeout으로 변경
    setTimeout(() => {
      this.checklist.checklistItems = grist.dirtyData.records.map((row, idx) => {
        return {
          ...row,
          detailType: checklistDetailTypes[row.detailType],
          sequence: idx
        }
      })
      this.checklist = { ...this.checklist }
    }, 100)
  }
}
