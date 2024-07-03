import '@material/web/icon/icon.js'
import '@material/web/button/elevated-button.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'

import { PageView } from '@operato/shell'
import { PageLifecycle } from '@operato/shell/dist/src/app/pages/page-view'
import { css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { client } from '@operato/graphql'
import { notify } from '@operato/layout'

import gql from 'graphql-tag'
import { Building, Project } from './project-list'

@customElement('project-schedule')
export class ProjectSchedule extends ScopedElementsMixin(PageView) {
  static styles = [
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

        div[button-container] {
          display: flex;
          align-items: center;
          justify-content: end;
          flex: 0.5;

          md-elevated-button {
            margin: 0px 3px;

            --md-elevated-button-container-height: 35px;
            --md-elevated-button-label-text-size: 16px;
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
      }

      div[body] {
        display: flex;
        flex-direction: column;
        margin: 0px 25px 25px 25px;
        gap: 15px;

        h3 {
          color: #2e79be;
          font-size: 18px;
          margin: 0px;
        }

        & > div {
          display: flex;
          border-radius: 5px;
        }

        div[chart-container] {
          flex: 1;
          flex-direction: column;
          border: 1px solid #cccccc80;

          div[chart] {
            flex: 0.7;
            background: #03a9f44d;
          }

          div[table] {
            flex: 0.3;
            background: #8fd170b8;
          }
        }

        div[select-container] {
          gap: 15px;

          div[date] {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #2ea4df1a;
            border: 1px solid #2ea4df33;
            border-radius: 5px;
            gap: 12px;
            padding: 12px 36px 12px 15px;

            span[name] {
              font-size: 16px;
              font-weight: bold;
            }
          }

          div[button] {
            flex: 1;
            border-radius: 5px;
            border: 1px solid #cccccc80;
            background-color: #fff;
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

  render() {
    return html`
      <div header>
        <h2>${this.project.name}</h2>
        <div button-container>
          <md-elevated-button href=${`project-update/${this.project.id}`}>
            <md-icon slot="icon">assignment</md-icon>프로젝트 정보 수정
          </md-elevated-button>
          <md-elevated-button href=${`project-plan-management/${this.project.id}`}>
            <md-icon slot="icon">description</md-icon>도면 관리
          </md-elevated-button>
          <md-elevated-button href=${`project-task-update/${this.project.id}`}>
            <md-icon slot="icon">event_note</md-icon>공정표 관리
          </md-elevated-button>
        </div>
      </div>

      <div body>
        <div chart-container>
          <div chart>
            <table></table>
          </div>
          <div table>
            <table></table>
          </div>
        </div>
        <div select-container>
          <div date>
            <span name>기간선택</span>
            <div>
              <input type="date" name="startDate" project .value=${this.project.startDate || ''} max="9999-12-31" />
              ~
              <input type="date" name="endDate" project .value=${this.project.endDate || ''} max="9999-12-31" />
            </div>
          </div>
          <div button></div>
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
        query Project($id: String!) {
          project(id: $id) {
            id
            name
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
      `,
      variables: {
        id: projectId
      }
    })

    this.project = response.data?.project

    console.log('init project : ', this.project)
  }
}