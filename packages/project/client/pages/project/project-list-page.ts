import '@operato/data-grist'

import { CommonButtonStyles, CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageView, store } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { ColumnConfig, DataGrist, FetchOption, SortersControl } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { i18next, localize } from '@operato/i18n'
import { notify, openPopup } from '@operato/layout'
import { OxPopup, OxPrompt } from '@operato/popup'
import { isMobileDevice } from '@operato/utils'

import { connect } from 'pwa-helpers/connect-mixin'
import gql from 'graphql-tag'

export enum ProjectStatus {
  'PROCEEDING' = '10',
  'COMPLICATED' = '20'
}

export interface Project {
  id?: string
  name: string
  startDate?: string
  endDate?: string
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
  address: string
  area: number
  constructionCompany: string
  clientCompany: string
  designCompany: string
  supervisoryCompany: string
  mainPhoto?: string
  constructionType: string
  constructionCost?: number
  etc?: string
  householdCount?: number
  buildingCount?: number
  buildings?: Building[]
}
export interface Building {
  id?: string
  name: string | undefined
  floorCount: number | undefined
}
@customElement('project-list-page')
export class ProjectListPage extends connect(store)(localize(i18next)(ScopedElementsMixin(PageView))) {
  static styles = [
    ScrollbarStyles,
    CommonGristStyles,
    css`
      :host {
        display: flex;

        width: 100%;

        --grid-record-emphasized-background-color: red;
        --grid-record-emphasized-color: yellow;
      }
    `
  ]

  get context() {
    return {
      title: i18next.t('title.project_setting_list')
    }
  }

  @state() private projectName: string = ''
  @state() private projectList: Project[] = []
  @state() private projectCount: number = 0

  render() {
    return html`
      <div main>
        <div header></div>
        <div body>
          ${this.projectList?.map(project => {
            return html`
              <a href="project-update/${project.id}">
                <div>
                  <img />
                  <span> </span></div
              ></a>
            `
          })}
        </div>
      </div>
    `
  }

  async pageInitialized(lifecycle: any) {}

  async pageUpdated(changes: any, lifecycle: any) {
    if (this.active) {
      this.getProjectList()
    }
  }

  async getProjectList() {
    const response = await client.query({
      query: gql`
        query Projects($projectName: String!) {
          projects(projectName: $projectName) {
            items {
              id
              name
              createdAt
            }
            total
          }
        }
      `,
      variables: {
        projectName: this.projectName || ''
      }
    })

    this.projectList = response.data.projects?.items || []
    this.projectCount = response.data.projects?.total || 0
  }
}
