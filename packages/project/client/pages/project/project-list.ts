import '@material/web/icon/icon.js'

import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import gql from 'graphql-tag'
import { Attachment } from '@things-factory/attachment-base'
import type { FileUpload } from 'graphql-upload/GraphQLUpload.js'

export enum ProjectStatus {
  'ONGOING' = '10',
  'COMPLETED' = '20'
}
export enum BuildingInspectionStatus {
  REQUEST = 'REQUEST',
  PASS = 'PASS',
  FAIL = 'FAIL'
}
export const BUILDING_INSPECTION_STATUS = {
  REQUEST: '요청',
  PASS: '통과',
  FAIL: '실패'
}

export interface Project {
  id?: string
  name: string
  startDate?: string
  endDate?: string
  mainPhoto?: Attachment
  mainPhotoUpload?: FileUpload
  totalProgress?: number
  weeklyProgress?: number
  kpi?: number
  inspPassRate?: number
  robotProgressRate?: number
  structuralSafetyRate?: number
  buildingComplex: BuildingComplex
}
export interface BuildingComplex {
  id?: string
  address?: string
  latitude?: number
  longitude?: number
  area?: number
  constructionCompany?: string
  clientCompany?: string
  designCompany?: string
  supervisoryCompany?: string
  drawing?: Attachment
  drawingUpload?: FileUpload
  constructionType?: string
  constructionCost?: number
  etc?: string
  householdCount?: number
  buildingCount?: number
  notice?: string
  planXScale?: number
  planYScale?: number
  buildings?: Building[]
}
export interface Building {
  id?: string
  name: string | undefined
  floorCount: number | undefined
  drawing?: Attachment
  drawingUpload?: FileUpload
  buildingLevels?: BuildingLevel[]
}

export interface BuildingLevel {
  id?: string
  floor?: number
  mainDrawing?: Attachment
  mainDrawingImage?: string
  mainDrawingThumbnail?: string
  mainDrawingUpload?: FileUpload
  elevationDrawing?: Attachment
  elevationDrawingThumbnail?: string
  elevationDrawingUpload?: FileUpload
  rebarDistributionDrawing?: Attachment
  rebarDistributionDrawingThumbnail?: string
  rebarDistributionDrawingUpload?: FileUpload
  building?: Building
  buildingInspections?: BuildingInspection[]
}

export interface BuildingInspection {
  id?: string
  attatchments?: Attachment[]
  // buildingInspectionAttachments?: BuildingInspectionAttachment[]
  status?: BuildingInspectionStatus
  requestDate?: Date
  buildingLevel?: BuildingLevel
  checklist?: Checklist
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export interface Checklist {
  id: string
  name?: string
  documentNo?: string
  constructionType?: string
  constructionDetailType?: string
  location?: string
  constructionInspectorDate?: Date
  supervisorInspectorDate?: Date
  overallConstructionSignature?: string
  taskConstructionSignature?: string
  overallSupervisorySignature?: string
  taskSupervisorySignature?: string
  // checklistItems?: ChecklistItem[]
}

@customElement('project-list')
export class ProjectListPage extends ScopedElementsMixin(PageView) {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        overflow-y: auto;

        width: 100%;
        height: 100%;
        background-color: #f7f7f7;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }

      div[header] {
        display: flex;
        height: 100px;
        align-items: center;
        background-color: #2ea4df1a;
        border: 1px solid #2ea4df33;
        margin: 15px 23px;
        font-size: 18px;
        padding: 7px;
        border-radius: 5px;

        md-filled-text-field[type='search'] {
          margin-left: 5px;
          margin-right: 26px;

          --md-filled-text-field-container-shape: 0px;
          --md-sys-color-primary: #006a6a;
          --md-sys-color-surface-container-highest: transparent;
          --md-filled-text-field-label-text-color: #999999;
          --md-filled-text-field-input-text-color: #4e5055;
        }

        md-elevated-button[add-project] {
          font-weight: bold;
          font-size: 16px;
          margin-left: 17px;
          padding: 13px 20px;

          --md-sys-color-surface-container-low: #24be7b;
          --md-sys-color-primary: #ffffff;
          --md-elevated-button-container-shape: 7px;
        }
      }

      div[body] {
        div[project-container] {
          height: 140px;
          margin: 17px 23px;
          background-color: #ffffff;
          border: 1px solid #cccccc80;
          border-radius: 5px;

          & > a {
            display: flex;
            width: 100%;
            height: 100%;
            text-decoration: none;
            color: #000;
          }

          img[project-img] {
            width: 285px;
            background-color: #cccccc80;
          }
          img[project-img][no-image] {
            object-fit: contain;
            opacity: 0.5;
          }

          span[project-info] {
            flex: 0.45;
            padding: 6px 15px;
            font-size: 16px;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            div[name] {
              color: #2e79be;
              font-weight: bold;
              font-size: 19px;
              margin-bottom: 2px;
            }
          }

          span[project-state] {
            flex: 0.55;
            padding: 10px 20px;

            & > div {
              margin-bottom: 3px;
            }

            div[progress] {
              position: relative;

              md-linear-progress {
                --md-linear-progress-track-height: 18px;
                --md-linear-progress-active-indicator-height: 18px;
                --md-linear-progress-track-shape: 5px;
                --md-sys-color-primary: #0595e51a;
                --md-sys-color-surface-container-highest: #0595e533;
              }

              span {
                position: absolute;
                top: 0;
                left: 12px;
                font-size: 12px;
                font-weight: bold;
                color: #2e79be;

                &:last-child {
                  left: unset;
                  right: 12px;
                }
              }
            }
          }
        }
      }
    `
  ]

  get context() {
    return {
      title: '진행중 프로젝트'
    }
  }

  @state() private projectName: string = ''
  @state() private projectList: Project[] = []
  @state() private projectCount: number = 0

  render() {
    return html`
      <div header>
        <label>프로젝트 이름</label>
        <md-filled-text-field
          name="projectName"
          type="search"
          label="프로젝트 이름"
          .value=${this.projectName}
          @input=${this._onInputChange}
          @keypress=${this._onKeypress}
        >
          <md-icon slot="leading-icon">search</md-icon>
        </md-filled-text-field>

        <strong>총 ${this.projectCount}개</strong>
      </div>

      <div body>
        ${this.projectList?.map((project: Project) => {
          return html`
            <div project-container>
              <a href=${`project-detail/${project.id}`}>
                <img
                  ?no-image=${!project.mainPhoto?.fullpath}
                  project-img
                  src=${project.mainPhoto?.fullpath || '/assets/images/no-image.png'}
                />

                <span project-info>
                  <div name>${project.name}</div>
                  <div content>${project.buildingComplex.address}</div>
                  <div content>면적: ${project.buildingComplex.area}㎡</div>
                  <div content>착공~준공: ${project.startDate}~${project.endDate}</div>
                  <div content>발주처: <strong>${project.buildingComplex.clientCompany}</strong></div>
                </span>

                <span project-state>
                  <div progress>
                    <md-linear-progress buffer="100" max="100" value=${project.totalProgress || 0}> </md-linear-progress>
                    <span>전체</span>
                    <span>${project.totalProgress || 0}%</span>
                  </div>
                  <div progress>
                    <md-linear-progress buffer="100" max="100" value=${project.weeklyProgress || 0}> </md-linear-progress>
                    <span>주간</span>
                    <span>${project.weeklyProgress || 0}%</span>
                  </div>
                  <div progress>
                    <md-linear-progress buffer="100" max="100" value=${project.kpi || 0}> </md-linear-progress>
                    <span>KPI</span>
                    <span>${project.kpi || 0}%</span>
                  </div>
                  <div progress>
                    <md-linear-progress buffer="100" max="100" value=${project.inspPassRate || 0}> </md-linear-progress>
                    <span>Inspection Passing Rate</span>
                    <span>${project.inspPassRate || 0}%</span>
                  </div>
                  <div progress>
                    <md-linear-progress buffer="100" max="100" value=${project.robotProgressRate || 0}> </md-linear-progress>
                    <span>Robot Progress</span>
                    <span>${project.robotProgressRate || 0}%</span>
                  </div>
                  <div progress>
                    <md-linear-progress buffer="100" max="100" value=${project.structuralSafetyRate || 0}> </md-linear-progress>
                    <span>Structural safety</span>
                    <span>${project.structuralSafetyRate || 0}%</span>
                  </div>
                </span>
              </a>
            </div>
          `
        })}
      </div>
    `
  }

  async pageInitialized(lifecycle: any) {
    this.getProjectList()
  }

  async pageUpdated(changes: any, lifecycle: any) {}

  async getProjectList() {
    const response = await client.query({
      query: gql`
        query Projects($filters: [Filter!]) {
          projects(filters: $filters) {
            items {
              id
              name
              startDate
              endDate
              mainPhoto {
                fullpath
              }
              totalProgress
              weeklyProgress
              kpi
              inspPassRate
              robotProgressRate
              structuralSafetyRate
              buildingComplex {
                address
                area
                clientCompany
              }
            }
            total
          }
        }
      `,
      variables: {
        filters: this.projectName
          ? [
              {
                name: 'name',
                operator: 'search',
                value: `%${this.projectName}%`
              }
            ]
          : []
      }
    })

    this.projectList = response.data.projects?.items || []
    this.projectCount = response.data.projects?.total || 0
  }

  // Input 요소의 값이 변경될 때 호출되는 콜백 함수
  private _onInputChange(event: InputEvent) {
    const target = event.target as HTMLInputElement
    this[target.name] = target.value
  }

  // 검색창에서 엔터입력시 검색
  private _onKeypress(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.getProjectList()
    }
  }
}
