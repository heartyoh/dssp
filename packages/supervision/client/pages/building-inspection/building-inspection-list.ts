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
  REQUEST = 'REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}
export const BUILDING_INSPECTION_STATUS = {
  [BuildingInspectionStatus.WAIT]: '검측 대기',
  [BuildingInspectionStatus.REQUEST]: '검측 요청',
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
      }

      div[header] h2 {
        flex: 0.5;
        color: #3f71a0;
      }

      div[body] {
        display: flex;
        flex-direction: column;
        margin: 0px 25px 0px 25px;
        gap: 10px;
        min-height: fit-content;
        overflow-x: hidden;
      }

      div[body] h3 {
        color: #2e79be;
        font-size: 18px;
        margin: 0px;
      }

      div[body] > div {
        display: flex;
        gap: 10px;
        border-radius: 5px;
      }

      div[top] {
        flex: 1;

        display: flex;
        background-color: #f7f7f7;
      }

      div[drawing] {
        flex: 0.4;
        border: 1px solid #cccccc80;
        background-color: #fff;
        padding: 10px;
        border-radius: 5px;

        img {
          width: 100%;

          display: block;
          object-fit: contain;
          object-position: center;
        }
      }

      div[inspection-container] {
        flex: 0.6;
        gap: 5px;

        display: flex;
        flex-direction: column;

        div[inspection] {
          display: grid;
          grid-template-columns: 120px 0.9fr 0.9fr 0.9fr 0.9fr;
          margin-top: 5px;
          background: #ebc8321a;
          border-radius: 7px;
          padding: 7px 0px;

          & > span {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            div[status='wait'] {
              color: #4e5055;
            }
            div[status='request'] {
              color: #3395f1;
            }
            div[status='pass'] {
              color: #1bb401;
            }
            div[status='fail'] {
              color: #ff4444;
            }
            span[dot] {
              font-size: 1.3em;
            }
          }
          & > span[name] {
            flex-direction: row;
            text-align: right;
            gap: 10px;
            border-right: 2px dotted #ccc;

            md-icon {
              width: 40px;
              height: 40px;
              border-radius: 7px;
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
              <span name bold>
                <md-icon slot="icon">fact_check</md-icon>
                검측<br />현황
              </span>

              ${Object.entries(BUILDING_INSPECTION_STATUS).map(inspectionStatus => {
                const displayName = inspectionStatus[1]
                const status = inspectionStatus[0].toLowerCase()

                return html`
                  <span>
                    <div>${displayName}</div>
                    <div bold status=${status}><span dot>●</span> ${this.buildingInspectionSummary[status]}</div>
                  </span>
                `
              })}
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
            renderer: value => BUILDING_INSPECTION_STATUS[value]
          },
          width: 120
        },
        {
          type: 'datetime',
          name: '',
          header: '검측 결과 데이터',
          width: 180
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
