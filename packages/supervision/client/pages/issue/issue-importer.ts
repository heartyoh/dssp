import '@operato/data-grist'

import gql from 'graphql-tag'
import { css, html, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'

import { client } from '@operato/graphql'
import { i18next } from '@operato/i18n'
import { isMobileDevice } from '@operato/utils'

export class IssueImporter extends LitElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;

        background-color: #fff;
      }

      ox-grist {
        flex: 1;
      }

      .button-container {
        display: flex;
        margin-left: auto;
        padding: var(--padding-default);
      }

      mwc-button {
        margin-left: var(--margin-default);
      }
    `
  ]

  @state() private issues: any[] = []
  @state() private columns = {
    list: { fields: ['name', 'description'] },
    pagination: { infinite: true },
    columns: [
      {
        type: 'string',
        name: 'name',
        header: i18next.t('field.name'),
        width: 150
      },
      {
        type: 'string',
        name: 'description',
        header: i18next.t('field.description'),
        width: 200
      },
      {
        type: 'checkbox',
        name: 'active',
        header: i18next.t('field.active'),
        width: 60
      }
    ]
  }

  render() {
    return html`
      <ox-grist
        .mode=${isMobileDevice() ? 'LIST' : 'GRID'}
        .config=${this.columns}
        .data=${
          { 
            records: this.issues 
          }
        }
      ></ox-grist>

      <div class="button-container">
        <mwc-button raised @click="${this.save.bind(this)}">${i18next.t('button.save')}</mwc-button>
      </div>
    `
  }

  private async save() {
    const response = await client.mutate({
      mutation: gql`
        mutation importIssues($issues: [IssuePatch!]!) {
          importIssues(issues: $issues)
        }
      `,
      variables: { issues: this.issues }
    })

    if (response.errors?.length) return

    this.dispatchEvent(new CustomEvent('imported'))
  }
}

