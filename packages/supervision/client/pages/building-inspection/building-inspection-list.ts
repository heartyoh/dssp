import '@material/web/icon/icon.js'
import '@operato/data-grist'

import { CommonGristStyles, CommonButtonStyles, ScrollbarStyles } from '@operato/styles'
import { PageView, navigate } from '@operato/shell'
import { css, html } from 'lit'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { customElement, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { DataGrist, FetchOption } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'
import gql from 'graphql-tag'
import { openPopup } from '@operato/layout'
import './inspection-create-popup'

export enum ChecklistTypeMainType {
  BASIC = '10',
  NON_BASIC = '20'
}
export const CHECKLIST_MAIN_TYPE_LIST = {
  [ChecklistTypeMainType.BASIC]: '기본 업무',
  [ChecklistTypeMainType.NON_BASIC]: '기본 외 업무'
}

export enum BuildingInspectionStatus {
  REQUEST = 'REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}
export const BUILDING_INSPECTION_STATUS = {
  [BuildingInspectionStatus.REQUEST]: '요청',
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

        h2 {
          flex: 0.5;
          color: #3f71a0;
        }
      }

      div[body] {
        display: grid;
        grid-template-columns: 4fr 6fr;
        margin: 0px 25px 25px 25px;
        gap: 10px;
        min-height: fit-content;

        h3 {
          color: #2e79be;
          font-size: 18px;
          margin: 0px;
        }

        & > div {
          display: flex;
          gap: 10px;
          padding: 15px;
          border-radius: 5px;
        }

        div[left] {
          flex-direction: column;
          background-color: #ffffff;
          border: 1px solid #cccccc80;

          div[drawing] {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;

            [building-img] {
              width: 70%;
              height: auto;
            }
            img[building-img] {
              opacity: 0.5;
            }
          }

          div[subject] {
            margin-bottom: 7px;
          }
          div[building-container] {
            display: block;
            height: 40px;
            overflow-y: auto;

            & > * {
              margin-right: 2px;
              margin-bottom: 7px;
            }
          }
        }

        div[right] {
          height: auto;
          overflow-y: auto;
        }
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
  @state() projectId: string = ''
  @state() project: any = { ...this.defaultProject }
  @state() selectedBuilding: any = {}
  @state() building: any = {}

  @query('ox-grist') private grist!: DataGrist

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
        <h2>${this.project.name} ${this.selectedBuilding.name}</h2>
      </div>

      <div body>
        <div left>
          <h3>${this.selectedBuilding.name} BIM도면</h3>
          <div drawing>
            ${this.selectedBuilding?.drawing?.fullpath
              ? html`<div building-img></div>`
              : html`<img building-img src="/assets/images/img-building-default.png" />`}
          </div>
          <div>
            <div subject bold>개별 단지 상세정보 바로가기</div>
            <div building-container>
              ${this.project.buildingComplex?.buildings?.map(building => {
                return this.selectedBuilding.id === building.id
                  ? html`
                      <md-filled-button @click=${() => this._onClickBuilding(building)}> ${building.name} </md-filled-button>
                    `
                  : html`
                      <md-outlined-button @click=${() => this._onClickBuilding(building)}> ${building.name} </md-outlined-button>
                    `
              })}
            </div>
          </div>
        </div>

        <div right>
          <ox-grist .mode=${'GRID'} .config=${this.gristConfig} .fetchHandler=${this.fetchHandler.bind(this)}> </ox-grist>
        </div>
      </div>
    `
  }

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      this.projectId = lifecycle.resourceId || ''

      // buildingId가 있으면 선택
      const params: any = lifecycle.params
      await this.initProject(lifecycle.resourceId, params.buildingId)
    }
  }

  async initProject(projectId: string = '', buildingId: string = '') {
    const response = await client.query({
      query: gql`
        query Project($id: String!) {
          project(id: $id) {
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
        }
      `,
      variables: {
        id: projectId
      }
    })

    if (response.errors) return

    this.project = response.data?.project

    // buildingId 파라미터가 있으면 선택된 빌딩, 없으면 첫번째 빌딩 선택
    this.selectedBuilding = buildingId
      ? this.project?.buildingComplex?.buildings.filter(v => v.id === buildingId)[0]
      : this.project?.buildingComplex?.buildings[0]

    // 좌측 빌딩 도면 불러오기
    this._getBuilding(this.selectedBuilding.id)
  }

  async _getBuilding(buildingId: string = '') {
    const response = await client.query({
      query: gql`
        query Building($id: String!) {
          building(id: $id) {
            id
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

    this.building = response.data?.building
  }

  private _onClickBuilding(building) {
    this.selectedBuilding = { ...building }
    this._getBuilding(this.selectedBuilding.id)
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
          header: '위치 및 부위',
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
          name: 'constructionDetailType',
          header: '세부 공종',
          width: 200
        },
        {
          type: 'string',
          name: 'requestDate',
          header: '검측 요청일',
          record: {
            renderer: value =>
              value
                ? new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Seoul',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).format(new Date(value))
                : ''
          },
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
    const response = await client.query({
      query: gql`
        query BuildingInspections($filters: [Filter!], $pagination: Pagination) {
          buildingInspections(filters: $filters, pagination: $pagination) {
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
              }
            }
            total
          }
        }
      `,
      variables: {
        filters,
        pagination: { page, limit },
        sortings
      }
    })

    let items = response.data.buildingInspections?.items || []
    items = items.map(item => ({
      ...item,
      ...item.checklist
    }))

    return {
      total: response.data.buildingInspections.total || 0,
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
          .projectId=${this.projectId}
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
}
