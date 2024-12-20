import '@material/web/icon/icon.js'
import '@material/web/button/elevated-button.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'

import { PageView } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { i18next } from '@operato/i18n'
import { openPopup } from '@operato/layout'
import gql from 'graphql-tag'
import { Project } from './project-list'
import { keyed } from 'lit/directives/keyed.js'
import { ScrollbarStyles } from '@operato/styles'
import '@operato/gantt/ox-gantt.js'
import './popup/popup-schedule-upload'

const TaskFragment = gql`
  fragment TaskFragment on Task {
    type
    title: name
    id: code
    duration
    startDate
    endDate
    dependsOn
    progress
    style
    resources {
      type
      allocated
    }
  }
`

@customElement('project-schedule')
export class ProjectSchedule extends ScopedElementsMixin(PageView) {
  static styles = [
    ScrollbarStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;

        color: #4e5055;

        width: 100%;
        background-color: var(--md-sys-color-background, #f6f6f6);
        overflow-y: auto;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }

      *[bold] {
        font-weight: bold;
      }

      div[header] {
        display: flex;
        margin: 0px var(--spacing-large, 12px);

        h2 {
          flex: 0.5;
          color: #3f71a0;
          font-size:18px;
        }

        div[button-container] {
          display: flex;
          align-items: center;
          justify-content: end;
          flex: 0.5;

          md-elevated-button {
            margin: 0px margin-left: var(--spacing-small, 4px);

            --md-elevated-button-container-height: 32px;
            --md-elevated-button-label-text-size: 16px;
            --md-elevated-button-container-color: #0595e5;

            --md-elevated-button-label-text-color: var(--md-sys-color-on-primary);
            --md-elevated-button-hover-label-text-color: var(--md-sys-color-on-primary);
            --md-elevated-button-pressed-label-text-color: var(--md-sys-color-on-primary);
            --md-elevated-button-focus-label-text-color: var(--md-sys-color-on-primary);
            --md-elevated-button-icon-color: var(--md-sys-color-on-primary);
            --md-elevated-button-hover-icon-color: var(--md-sys-color-on-primary);
            --md-elevated-button-pressed-icon-color: var(--md-sys-color-on-primary);
            --md-elevated-button-focus-icon-color: var(--md-sys-color-on-primary);
          }
        }
      }

      div[body] {
        flex: 1;

        display: flex;
        flex-direction: column;
        margin: var(--spacing-large, 12px);
        margin-top:0;
        gap: var(--spacing-medium, 8px);
        overflow: hidden;

        h3 {
          color: #2e79be;
          font-size: 16px;
          margin: 0px;
        }

        & > div {
          display: flex;
          border-radius: 5px;
        }

        ox-gantt {
          flex: 1;
          box-sizing: border-box;
          overflow: hidden;

          background-color: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }

        div[select-container] {
          gap: var(--spacing-medium, 8px);

          div[date] {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #2ea4df1a;
            border: 1px solid #2ea4df33;
            border-radius: 5px;
            gap: var(--spacing-medium, 8px);
            padding: 12px 36px 12px 15px;

            span[name] {
              font-size: 16px;
              font-weight: bold;
            }

            input[type="date"] {
              border:1px solid rgba(51,51,51,.20);
              padding:var(--spacing-small, 4px) var(--spacing-medium, 8px);
              border-radius: 5px;
            }
          }

          div[construction-list-container] {
            flex: 1;
            display: flex;
            border-radius: 5px;
            border: 1px solid #cccccc80;
            background-color: #fff;
            padding: var(--spacing-medium, 8px) var(--spacing-large, 12px);
            gap: var(--spacing-medium, 8px);
            overflow-x: auto;

            md-outlined-button {
              --md-outlined-button-container-height: 30px;
              --md-outlined-button-trailing-space: var(--spacing-medium, 8px);
              --md-outlined-button-leading-space: var(--spacing-medium, 8px);
              --md-outlined-button-label-text-color: #586878;
              --md-sys-color-outline: rgba(51,51,51,.20);
              box-shadow: 1px 1px 1px #0000001a;
              padding: var(--spacing-medium, 8px) var(--spacing-large, 12px);
              font-weight: 700;
            }
          }
        }
      }
    `
  ]

  get context() {
    return {
      title: '공정표'
    }
  }

  private defaultProject = {
    name: '',
    buildingComplex: {
      address: '',
      area: 0,
      constructionCompany: '',
      clientCompany: '',
      supervisoryCompany: '',
      designCompany: '',
      constructionType: '',
      buildings: []
    }
  }
  @state() projectId: string = ''
  @state() project: Project = { ...this.defaultProject }
  @state() selectedBuildingIdx: number = 0
  @state() tasks
  @state() constructionTypeList = []

  @state() private fromDate = '2024-01-01'
  @state() private toDate = '2026-12-31'

  @query('input[name="startDate"]') inputStartDate!: HTMLInputElement
  @query('input[name="endDate"]') inputEndDate!: HTMLInputElement

  private timeScale = 'week-day'
  private extendGridLines = false

  private columnConfigProvider = function () {
    return [
      { name: 'title', label: i18next.t('label.gantt-task-title') || 'title', visible: true, width: 150, order: 1 },
      {
        name: 'startDate',
        label: i18next.t('label.gantt-task-start-date') || 'start date',
        visible: true,
        width: 100,
        order: 2
      },
      {
        name: 'resources',
        label: i18next.t('label.gantt-task-resources') || 'resources',
        visible: true,
        width: 100,
        order: 3
      },
      {
        name: 'duration',
        label: i18next.t('label.gantt-task-duration') || 'duration',
        visible: true,
        width: 30,
        order: 4
      }
    ]
  }

  render() {
    return html`
      <div header>
        <h2>${this.project.name}</h2>
        <div button-container>
          <md-elevated-button @click=${this._openUploadSchedulePopup}>
            <md-icon slot="icon">event_note</md-icon>공정표 관리
          </md-elevated-button>
        </div>
      </div>

      <div body>
        <ox-gantt
          from-date=${new Date(this.fromDate).toISOString().split('T')[0]}
          to-date=${new Date(this.toDate).toISOString().split('T')[0]}
          .timeScale=${this.timeScale}
          .tasks=${this.tasks}
          @date-range-selected=${this.onRangeSelected}
          @task-clicked=${(e: CustomEvent) => {
            console.log('task-clicked', e.detail)
          }}
          ?extend-grid-lines=${this.extendGridLines}
          .columnConfigProvider=${this.columnConfigProvider}
          .colorProvider=${task => {
            return task.style || 'gray'
          }}
        >
        </ox-gantt>
        <div select-container>
          <div date>
            <span name>기간선택</span>
            <div @change=${() => this.onChangePeriodRange()}>
              <input type="date" name="startDate" project .value=${this.project.startDate || ''} max="9999-12-31" />
              ~
              <input type="date" name="endDate" project .value=${this.project.endDate || ''} max="9999-12-31" />
            </div>
          </div>
          <div construction-list-container>
            ${this.constructionTypeList?.map(
              (constructionType: any) =>
                html` <md-outlined-button id=${constructionType.id}>${constructionType.title}</md-outlined-button>`
            )}
          </div>
        </div>
      </div>
    `
  }

  async pageInitialized(lifecycle: PageLifecycle) {}

  async pageUpdated(changes: any, lifecycle: PageLifecycle) {
    if (this.active) {
      this.projectId = lifecycle.resourceId || ''
      await this.initProject(this.projectId)
    }
  }

  async initProject(projectId: string = '') {
    const response = await client.query({
      query: gql`
        query Project($id: String!, $sortings: [Sorting!]) {
          project(id: $id) {
            id
            name
            startDate
            endDate
            rootTasks {
              ...TaskFragment
              children(sortings: $sortings) {
                ...TaskFragment
                children(sortings: $sortings) {
                  ...TaskFragment
                }
              }
            }
            scheduleTable {
              id
              name
            }
            buildingComplex {
              id
              planXScale
              planYScale
              buildings {
                id
                name
                drawing {
                  id
                  name
                }
                buildingLevels {
                  id
                  floor
                  mainDrawing {
                    id
                    name
                  }
                }
              }
            }
          }
        }

        ${TaskFragment}
      `,
      variables: {
        id: projectId,
        sortings: [{ name: 'startDate' }]
      }
    })

    this.project = response.data?.project
    this.tasks = response.data?.project.rootTasks

    if (this.project) {
      this.fromDate = this.project.startDate || '2024-01-01' /* TODO default: start date of this year - 3 */
      this.toDate = this.project.endDate || '2026-12-31' /* TODO defaule: end date of this year + 3 */
    }

    console.log('init project : ', this.project)
  }

  onChangePeriodRange() {
    this.fromDate = this.inputStartDate.value
    this.toDate = this.inputEndDate.value
  }

  onRangeSelected(e: CustomEvent) {
    const selectedFromDate = new Date(e.detail.start + 'T00:00:00.000Z')
    const selectedToDate = new Date(e.detail.end + 'T23:59:59.000Z')

    this.constructionTypeList = this.tasks.filter(constuction => {
      const constuctionStartDate = new Date(constuction.startDate)
      const constuctionEndDate = new Date(constuction.endDate)

      return constuctionStartDate <= selectedToDate && constuctionEndDate >= selectedFromDate
    })
  }

  private _openUploadSchedulePopup() {
    openPopup(
      html`<popup-schedule-upload
        .projectId=${this.projectId}
        .scheduleTable=${this.project?.scheduleTable}
        @uploaded=${() => this.initProject(this.projectId)}
      ></popup-schedule-upload>`,
      {
        backdrop: true,
        size: 'medium',
        title: `공정표 업로드`
      }
    )
  }
}
