import '@material/web/icon/icon.js'
import '@operato/data-grist'

import gql from 'graphql-tag'
import { css, html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'

import { client } from '@operato/graphql'
import { i18next } from '@operato/i18n'
import { isMobileDevice } from '@operato/utils'
import { ButtonContainerStyles } from '@operato/styles'

export class DrawingImporter extends LitElement {
  static styles = [
    ButtonContainerStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;

        background-color: #fff;
      }

      ox-grist {
        flex: 1;
      }
    `
  ]

  @property({ type: Array }) drawings: any[] = []
  @property({ type: Object }) columns = {
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
            records: this.drawings 
          }
        }
      ></ox-grist>

      <div class="button-container">
        <button @click="${this.save.bind(this)}"><md-icon>save</md-icon>${i18next.t('button.save')}</button>
      </div>
    `
  }

  async save() {
    const response = await client.mutate({
      mutation: gql`
        mutation importDrawings($drawings: [DrawingPatch!]!) {
          importDrawings(drawings: $drawings)
        }
      `,
      variables: { drawings: this.drawings }
    })

    if (response.errors?.length) return

    this.dispatchEvent(new CustomEvent('imported'))
  }
}

