import '@operato/data-grist'

import { CommonButtonStyles, CommonGristStyles, ScrollbarStyles } from '@operato/styles'
import { PageView } from '@operato/shell'
import { css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { ScopedElementsMixin } from '@open-wc/scoped-elements'
import { ColumnConfig, DataGrist, FetchOption, SortersControl } from '@operato/data-grist'
import { client } from '@operato/graphql'
import { i18next, localize } from '@operato/i18n'

import gql from 'graphql-tag'

@customElement('project-setting-list')
export class ProjectSettingList extends localize(i18next)(ScopedElementsMixin(PageView)) {
  static styles = [
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

  render() {
    return html`
      <div main>
        <div header>
          <a href="/project-create">+ 신규 프로젝트 추가</a>
        </div>
        <div body></div>
      </div>
    `
  }

  async pageInitialized(lifecycle: any) {}

  async pageUpdated(changes: any, lifecycle: any) {
    if (this.active) {
      // do something here when this page just became as active
    }
  }
}
