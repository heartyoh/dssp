import '@things-factory/component-ui'
import '@things-factory/auth-ui/dist-client/components/ownership-transfer-popup'
import '@things-factory/auth-ui/dist-client/components/user-role-editor'
import '@things-factory/auth-ui/dist-client/components/create-user'

import gql from 'graphql-tag'
import { css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

import { client, gqlContext } from '@operato/graphql'
import { i18next } from '@operato/i18n'
import { PageView } from '@operato/shell'
import { OxPrompt } from '@operato/popup/ox-prompt.js'

@customElement('sv-user-management')
class SVUserManagement extends PageView {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        background-color: var(--main-section-background-color);
        padding: var(--padding-wide);
        overflow: auto;
      }

      @media screen and (max-width: 600px) {
        :host {
          padding: var(--padding-narrow);
        }
      }
    `
  ]

  @property({ type: Array }) domainUsers: any[] = []
  @property({ type: Object }) owner: any
  @property({ type: String }) currentTab: string = ''
  @property({ type: Boolean }) passwordResettable: boolean = false
  @property({ type: Boolean }) userCreatable: boolean = false

  @query('#user-list') userListElement!: HTMLElement & { close: () => void }

  get context() {
    return {
      title: i18next.t('text.user management'),
      help: 'auth/users'
    }
  }

  render() {
    const groupingUser = (this.domainUsers || []).reduce(
      (groupingUser, user) => {
        const userType = user.userType
        if (!groupingUser[userType]) {
          groupingUser[userType] = []
        }
        user.activated = user.status === 'activated'
        groupingUser[userType].push(user)

        return groupingUser
      },
      {
        admin: [],
        user: [],
        application: [],
        appliance: []
      }
    )

    const USER_TYPES = {
      USER: i18next.t('label.user'),
      APPLICATION: i18next.t('label.application'),
      APPLIANCE: i18next.t('text.appliance')
    }

    const userSet = {
      [USER_TYPES.USER]: [...groupingUser.user, ...groupingUser.admin],
      [USER_TYPES.APPLICATION]: groupingUser.application,
      [USER_TYPES.APPLIANCE]: groupingUser.appliance
    }

    return html`
      ${this.userCreatable
        ? html`<create-user
            @create-user=${async event => {
              const user = event.detail
              user.userType = 'user'

              await this.createUser(user)
            }}
          ></create-user>`
        : ''}
      <quick-find-list
        id="user-list"
        .data=${userSet}
        @tabChanged=${e => (this.currentTab = e.detail.currentTabKey)}
        .headerRenderer=${user => {
          return html`
            ${!user.activated
              ? html`
                  <mwc-icon>do_disturb</mwc-icon>
                  ${user.name}
                `
              : html` ${user.owner ? html` <mwc-icon>supervisor_account</mwc-icon> ` : ''} ${user.name} `}
          `
        }}
        .contentRenderer=${user =>
          html` <user-role-editor
            .user=${user}
            .domainOwner=${this.owner}
            .activate=${user.activated}
            @userUpdated=${this.refreshUsers.bind(this)}
            @ownershipTransferred=${this.refreshUsers.bind(this)}
            .passwordResettable=${this.passwordResettable}
          ></user-role-editor>`}
      ></quick-find-list>
    `
  }

  async pageUpdated(changes, lifecycle, before) {
    if (this.active) {
      this.refreshUsers()
      this.checkPasswordResettable()
      this.checkUserCreatable()
    }
  }

  async refreshUsers() {
    const domainUsersResp = await client.query({
      query: gql`
        query {
          users {
            items {
              id
              name
              email
              userType
              status
              owner
            }
          }
        }
      `,
      context: gqlContext()
    })

    if (!domainUsersResp.errors?.length) {
      this.domainUsers = domainUsersResp.data.users.items || []
      this.owner = this.domainUsers.filter(user => user.owner)[0] || {}
      this.userListElement?.close()
    }
  }

  async checkPasswordResettable() {
    const response = await client.query({
      query: gql`
        query {
          checkResettablePasswordToDefault
        }
      `
    })

    if (!response.errors) {
      this.passwordResettable = response.data.checkResettablePasswordToDefault
    }
  }

  async checkUserCreatable() {
    const response = await client.query({
      query: gql`
        query {
          checkDefaultPassword
        }
      `
    })

    if (!response.errors) {
      this.userCreatable = response.data.checkDefaultPassword
    }
  }

  async createUser(user) {
    if (
      await OxPrompt.open({
        title: i18next.t('text.are_you_sure'),
        text: i18next.t('text.are_you_sure_to_x_user', { x: i18next.t('button.create') }),
        confirmButton: { text: i18next.t('button.confirm') },
        cancelButton: { text: i18next.t('button.cancel') }
      })
    ) {
      const response = await client.mutate({
        mutation: gql`
          mutation createUser($user: NewUser!) {
            createUser(user: $user) {
              name
            }
          }
        `,
        variables: { user },
        context: gqlContext()
      })

      if (!response.errors) {
        await OxPrompt.open({
          title: i18next.t('text.completed'),
          confirmButton: { text: i18next.t('button.confirm') }
        })

        await this.refreshUsers()
      }
    }
  }

  showToast(message) {
    document.dispatchEvent(new CustomEvent('notify', { detail: { message, option: { timer: 1000 } } }))
  }
}
