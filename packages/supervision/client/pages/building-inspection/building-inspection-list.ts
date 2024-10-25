import '@material/web/icon/icon.js'
import '@operato/data-grist'

import { CommonGristStyles, CommonButtonStyles, ScrollbarStyles } from '@operato/styles'
import { PageView, navigate } from '@operato/shell'
import { css, html, TemplateResult } from 'lit'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { customElement, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { DataGrist, FetchOption } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'
import { openPopup } from '@operato/layout'
import './inspection-create-popup'
import '@operato/event-view/ox-event-view.js'
import { InspectionEventProvider } from './component/inspection-event-provider'
import { EventProvider } from '@operato/event-view'

export enum ChecklistTypeMainType {
  BASIC = '10',
  NON_BASIC = '20'
}
export const CHECKLIST_MAIN_TYPE_LIST = {
  [ChecklistTypeMainType.BASIC]: '기본 업무',
  [ChecklistTypeMainType.NON_BASIC]: '기본 외 업무'
}

export enum BuildingInspectionStatus {
  WAIT = 'WAIT',
  OVERALL_WAIT = 'OVERALL_WAIT',
  REQUEST = 'REQUEST',
  OVERALL_REQUEST = 'OVERALL_REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}
export const BUILDING_INSPECTION_STATUS_DISPLAY = {
  [BuildingInspectionStatus.WAIT]: '검측 대기',
  [BuildingInspectionStatus.OVERALL_WAIT]: '검측 대기',
  [BuildingInspectionStatus.REQUEST]: '검측 요청',
  [BuildingInspectionStatus.OVERALL_REQUEST]: '검측 요청',
  [BuildingInspectionStatus.PASS]: '합격',
  [BuildingInspectionStatus.FAIL]: '불합격'
}

@customElement('building-inspection-list')
export class BuildingInspectionList extends ScopedElementsMixin(PageView) {
  static styles = [
    ScrollbarStyles,
    CommonGristStyles,
    css`
      :host {
        display: grid;
        grid-template-rows: 55px auto;
        color: #4e5055;

        width: 100%;
        background-color: var(--md-sys-color-background, #f6f6f6);
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
        --md-outlined-button-trailing-space: var(--spacing-medium, 8px);
        --md-outlined-button-leading-space: var(--spacing-medium, 8px);
        --md-sys-color-outline: rgba(51,51,51,.20);
      }

      *[bold] {
        font-weight: bold;
      }

      div[header] {
        display: flex;
        margin: 0px var(--spacing-large, 12px);
        margin-bottom:var(--spacing-small, 5px);
      }

      div[header] h2 {
        flex: 0.5;
        color: #3f71a0;
        font-size:18px;
      }

      div[body] {
        display: flex;
        flex-direction: column;
        margin: var(--spacing-large, 12px);
        margin-top:0;
        gap: var(--spacing-medium, 8px);
        min-height: fit-content;
        overflow-x: hidden;
      }

      div[body] h3 {
        color: #2e79be;
        font-size: 16px;
        margin: 0px;
      }

      div[body] > div {
        display: flex;
        gap: var(--spacing-medium, 8px);
        border-radius: 5px;
      }

      div[top] {
        flex: 1;

        display: flex;
        background-color: #f7f7f7;
      }

      div[drawing] {
        flex: 1;
        border: 1px solid #cccccc80;
        background-color: var(--md-sys-color-on-primary);
        padding: var(--spacing-large, 12px);
        border-radius: 5px;

        img {
          width: 100%;

          display: block;
          object-fit: contain;
          object-position: center;
        }
      }

      div[inspection-container] {
        flex: 1;
        gap: var(--spacing-medium, 8px);

        display: flex;
        flex-direction: column;

        div[inspection] {
          display: grid;
          grid-template-columns: 90px 1fr 1fr 1fr 1fr;
          background: #ebc8321a;
          border-radius: 5px;
          padding: var(--spacing-medium, 8px) var(--spacing-large, 12px);

          & > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            span::before{
              display: inline-block;
              position: relative;
              content: "";
              width: 10px;
              height: 10px;
              border-radius: 6px;
              top: -1px;
              margin-right: 2px;
            }

            span[status='wait']::before{
              background-color: #4e5055;
            }
            span[status='request']::before {
              background-color: #3395f1;
            }
            span[status='pass']::before {
              background-color: #1bb401;
            }
            span[status='fail']::before {
              background-color: #ff4444;
            }
            span[dot] {
              font-size: 1.3em;
            }
          }
          & > div[name] {
            flex-direction: row;
            text-align: right;
            gap: var(--spacing-small, 4px);
            padding-right:var(--spacing-large, 12px);
            border-right: 2px dotted #ccc;
            max-width: 100%;
            line-height:1.3; 

            md-icon {
              width: 40px;
              height: 40px;
              border-radius: 5px;
              color: #fff;
              background: #f16154;
            }
          }
        }
      }

      ox-event-view {
        flex: 1;
      }

      div[bottom] {
        flex: 1;

        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 300px;
      }

      ox-grist {
        overflow-y: auto;
        flex: 1;
      }
    `
  ]

  private defaultProject = {
    name: '',
    buildingComplex: {
      buildings: []
    }
  }

  @state() private gristConfig: any
  @state() buildingLevelId: string = ''
  @state() project: any = { ...this.defaultProject }
  @state() location: string = ''
  @state() building: any = {}
  @state() drawingImage: string = ''
  @state() buildingInspectionSummary: any = {}
  @state() calendarData?: EventProvider

  @query('ox-grist') private grist!: DataGrist
  @query('ox-event-view') private eventView!: HTMLElement

  get context() {
    return {
      title: '검측 관리',
      actions: [
        {
          title: '검측 등록',
          action: this._openCreateInspection.bind(this),
          ...CommonButtonStyles.submit
        },
        {
          title: '삭제',
          action: this._deleteChecklistType.bind(this),
          ...CommonButtonStyles.delete
        }
      ]
    }
  }

  render() {
    return html`
      <div header>
        <h2>${this.project.name}</h2>
      </div>

      <div body>
        <div top>
          <div drawing>
            <h3>도면: ${this.location}</h3>
            <img src=${this.drawingImage || '/assets/images/img-drawing-default.png'} />
          </div>

          <div inspection-container>
            <div inspection>
              <div name bold>
                <md-icon slot="icon">fact_check</md-icon>
                검측 현황
              </div>

              <div>
                <label>${BUILDING_INSPECTION_STATUS_DISPLAY[BuildingInspectionStatus.WAIT]}</label>
                <span bold status=${BuildingInspectionStatus.WAIT.toLowerCase()}>
                  ${this.buildingInspectionSummary[BuildingInspectionStatus.WAIT.toLowerCase()]}
                </span>
              </div>
              <div>
                <label>${BUILDING_INSPECTION_STATUS_DISPLAY[BuildingInspectionStatus.REQUEST]}</label>
                <span bold status=${BuildingInspectionStatus.REQUEST.toLowerCase()}>
                  ${this.buildingInspectionSummary[BuildingInspectionStatus.REQUEST.toLowerCase()]}
                </span>
              </div>
              <div>
                <label>${BUILDING_INSPECTION_STATUS_DISPLAY[BuildingInspectionStatus.PASS]}</label>
                <span bold status=${BuildingInspectionStatus.PASS.toLowerCase()}>
                  ${this.buildingInspectionSummary[BuildingInspectionStatus.PASS.toLowerCase()]}
                </span>
              </div>
              <div>
                <label>${BUILDING_INSPECTION_STATUS_DISPLAY[BuildingInspectionStatus.FAIL]}</label>
                <span bold status=${BuildingInspectionStatus.FAIL.toLowerCase()}>
                  ${this.buildingInspectionSummary[BuildingInspectionStatus.FAIL.toLowerCase()]}
                </span>
              </div>
            </div>

            <ox-event-view
              .mode=${'monthly'}
              .eventProvider=${this.calendarData}
              @select-date=${(e: CustomEvent) => {
                console.log('select-date', e.detail)
              }}
            >
            </ox-event-view>
          </div>
        </div>

        <div bottom>
          <ox-grist .mode=${'GRID'} .config=${this.gristConfig} .fetchHandler=${this.fetchHandler.bind(this)}> </ox-grist>
        </div>
      </div>
    `
  }

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      this.buildingLevelId = lifecycle.resourceId || ''

      await this.initProject(this.buildingLevelId)
      this.grist.fetch()
    }
  }

  async initProject(buildingLevelId: string = '') {
    const response = await client.query({
      query: gql`
        query ProjectByBuildingLevelId($buildingLevelId: String!) {
          projectByBuildingLevelId(buildingLevelId: $buildingLevelId) {
            id
            name
            mainPhoto {
              fullpath
            }
            buildingComplex {
              id
              drawing {
                id
                name
                fullpath
              }
              buildings {
                id
                name
              }
            }
          }

          buildingInspectionSummaryOfBuildingLevel(buildingLevelId: $buildingLevelId) {
            wait
            request
            pass
            fail
          }
        }
      `,
      variables: {
        buildingLevelId
      }
    })

    if (response.errors) return

    this.project = response.data?.projectByBuildingLevelId
    this.buildingInspectionSummary = response.data?.buildingInspectionSummaryOfBuildingLevel

    this.calendarData = new InspectionEventProvider(buildingLevelId)

    // 캘린더 최소 높이 속성 수정
    this.eventView.style.setProperty('--calendar-monthly-date-min-height', '50px')
  }

  async pageInitialized(lifecycle: any) {
    this.gristConfig = {
      columns: [
        { type: 'gutter', gutterName: 'sequence' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'string',
          name: 'id',
          hidden: true
        },
        {
          type: 'string',
          name: 'location',
          header: '위치',
          width: 150
        },
        {
          type: 'string',
          name: 'constructionType',
          header: '공종',
          width: 120
        },
        {
          type: 'string',
          name: 'inspectionParts',
          header: '검측 부위',
          record: {
            renderer: value => value?.join(', ') || ''
          },
          width: 200
        },
        {
          type: 'string',
          name: 'requestDate',
          header: '검측 요청일',
          width: 120
        },
        {
          type: 'string',
          name: 'status',
          header: '검측 결과',
          record: {
            renderer: value => BUILDING_INSPECTION_STATUS_DISPLAY[value]
          },
          width: 120
        }
      ],
      rows: {
        selectable: {
          multiple: true
        },
        appendable: false,
        handlers: {
          click: (columns, data, column, record, rowIndex) => {
            navigate(`building-inspection-detail-drawing/${record.id}`)
          }
        }
      },
      sorters: [{ name: 'requestDate' }]
    }
  }

  async fetchHandler({ page = 1, limit = 100, sortings = [], filters = [] }: FetchOption) {
    if (!this.buildingLevelId) return

    const response = await client.query({
      query: gql`
        query BuildingInspectionsOfBuildingLevel($params: BuildingInspectionsOfBuildingLevel!, $buildingLevelId: String!) {
          buildingInspectionsOfBuildingLevel(params: $params) {
            items {
              id
              status
              requestDate
              checklist {
                checklistId: id
                name
                constructionType
                constructionDetailType
                location
                inspectionParts
              }
            }
            total
          }

          buildingLevel(id: $buildingLevelId) {
            id
            floor
            building {
              id
              name
            }
            mainDrawing {
              id
              name
              fullpath
            }
            mainDrawingImage
          }
        }
      `,
      variables: {
        params: {
          buildingLevelId: this.buildingLevelId,
          limit: 0
        },
        buildingLevelId: this.buildingLevelId
      }
    })

    let items = response.data?.buildingInspectionsOfBuildingLevel?.items || []
    items = items.map(item => ({
      ...item,
      ...item.checklist,
      requestDate: this._formatDate(item.requestDate)
    }))
    const buildingLevel = response.data?.buildingLevel

    this.location = `${buildingLevel.building.name} ${buildingLevel.floor}층` || ''
    this.drawingImage = buildingLevel?.mainDrawingImage || ''
    this.building = buildingLevel?.building || {}

    return {
      total: response.data?.buildingInspectionsOfBuildingLevel?.total || 0,
      records: items
    }
  }

  private async _deleteChecklistType() {
    if (confirm('삭제하시겠습니까?')) {
      const ids = this.grist.selected.map(record => record.id)
      if (ids && ids.length > 0) {
        const response = await client.mutate({
          mutation: gql`
            mutation ($ids: [String!]!) {
              deleteBuildingInspections(ids: $ids)
            }
          `,
          variables: {
            ids
          }
        })

        if (!response.errors) {
          this.grist.fetch()
          notify({ message: '삭제되었습니다.' })
        }
      }
    }
  }

  private _openCreateInspection() {
    openPopup(
      html`
        <inspection-create-popup
          .projectId=${this.project.id}
          .selectedBuildingId=${this.building.id}
          .selectedBuildingLevelId=${this.buildingLevelId}
          @requestRefresh="${() => this.grist.fetch()}"
        ></inspection-create-popup>
      `,
      {
        backdrop: true,
        size: 'large',
        title: '검측 요청서 등록'
      }
    )
  }

  private _formatDate(date: Date | undefined) {
    return date
      ? new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(date))
      : ''
  }
}
