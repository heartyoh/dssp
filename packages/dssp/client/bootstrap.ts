import '@operato/i18n/ox-i18n.js'
import '@things-factory/notification'
import './viewparts/user-circle'
import './viewparts/menu-tools'

import { html } from 'lit-html'

import { registerDefaultGroups } from '@operato/board'
import { navigate, store } from '@operato/shell'

import { appendViewpart, toggleOverlay, TOOL_POSITION, VIEWPART_POSITION } from '@operato/layout'
import { APPEND_APP_TOOL } from '@things-factory/apptool-base/client'
import { setupAppToolPart } from '@things-factory/apptool-ui/dist-client'
import { hasPrivilege } from '@things-factory/auth-base/dist-client'
import { setAuthManagementMenus } from '@things-factory/auth-ui/dist-client'
import { ADD_MORENDA } from '@things-factory/more-base/client'
import { ADD_SETTING } from '@things-factory/setting-base/dist-client'

console.log(
  `%c
▄▄▄   ▄▄▄   ▄▄▄  ▄▄▄  
▓  ▓ ▓   ▀ ▓   ▀ ▓  ▓ 
▓  ▓ ▀▀▄▄  ▀▀▄▄  ▓▀▀  
▓  ▓ ▄   ▓ ▄   ▓ ▓    
▀▀▀   ▀▀▀   ▀▀▀  ▀    
`,
  'background: #222; color: #bada55'
)

export default async function bootstrap() {
  /* set board-modeller group and default templates */
  registerDefaultGroups()

  await setupAppToolPart({
    toolbar: true,
    busybar: true,
    mdibar: false
  })

  // await setupContextUIPart({
  //   titlebar: 'header',
  //   contextToolbar: 'page-footer'
  // })

  appendViewpart({
    name: 'dcsp-topmenu',
    viewpart: {
      show: true,
      template: html` <menu-tools></menu-tools> `
    },
    position: VIEWPART_POSITION.NAVBAR
  })

  /* setting app-tools */
  store.dispatch({
    type: APPEND_APP_TOOL,
    tool: {
      name: 'app-brand',
      template: html` <span style="font-size: 1.2em;">AIM</span> `,
      position: TOOL_POSITION.FRONT
    }
  })

  store.dispatch({
    type: APPEND_APP_TOOL,
    tool: {
      name: 'notification-badge',
      template: html`
        <notification-badge
          @click=${e => {
            toggleOverlay('notification', {
              backdrop: true
            })
          }}
        >
        </notification-badge>
      `,
      position: TOOL_POSITION.REAR
    }
  })

  appendViewpart({
    name: 'notification',
    viewpart: {
      show: false,
      hovering: 'edge',
      template: html` <notification-list style="min-width: 300px;"></notification-list> `
    },
    position: VIEWPART_POSITION.ASIDEBAR
  })

  store.dispatch({
    type: APPEND_APP_TOOL,
    tool: {
      name: 'user-circle',
      template: html` <user-circle> </user-circle> `,
      position: TOOL_POSITION.REAR
    }
  })

  /* add setting morenda */
  store.dispatch({
    type: ADD_MORENDA,
    morenda: {
      icon: html` <mwc-icon>settings</mwc-icon> `,
      name: html` <ox-i18n msgid="label.setting"></ox-i18n> `,
      action: () => {
        navigate('setting')
      }
    }
  })

  store.dispatch({
    type: ADD_MORENDA,
    morenda: {
      icon: html` <mwc-icon>settings</mwc-icon> `,
      name: html` <ox-i18n msgid="인력관리"></ox-i18n> `,
      action: () => {
        navigate('human_resource')
      }
    }
  })

  store.dispatch({
    type: ADD_SETTING,
    setting: {
      seq: 21,
      template: html` <lite-menu-setting-let></lite-menu-setting-let> `
    }
  })

  /* set auth management menus into more-panel */
  setAuthManagementMenus()

  if (
    await hasPrivilege({
      privilege: 'mutation',
      category: 'user',
      domainOwnerGranted: true,
      superUserGranted: true
    })
  ) {
    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <mwc-icon>vpn_key</mwc-icon> `,
        name: html` <ox-i18n msgid="text.oauth2-clients"></ox-i18n> `,
        action: () => {
          navigate('oauth2-clients')
        }
      }
    })
  }

  if (
    await hasPrivilege({
      privilege: 'mutation',
      category: 'board',
      domainOwnerGranted: true,
      superUserGranted: true
    })
  ) {
    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <mwc-icon>font_download</mwc-icon> `,
        name: html` <ox-i18n msgid="menu.fonts"></ox-i18n> `,
        action: () => {
          navigate('font-list')
        }
      }
    })

    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <mwc-icon>dvr</mwc-icon> `,
        name: html` <ox-i18n msgid="menu.board-list"></ox-i18n> `,
        action: () => {
          navigate('board-list')
        }
      }
    })
  }

  if (
    await hasPrivilege({
      privilege: 'query',
      category: 'attachment',
      domainOwnerGranted: true,
      superUserGranted: true
    })
  ) {
    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <mwc-icon>attachment</mwc-icon> `,
        name: html` <ox-i18n msgid="menu.attachments"></ox-i18n> `,
        action: () => {
          navigate('attachment-list')
        }
      }
    })
  }

  if (await hasPrivilege({ privilege: 'mutation', category: 'scenario', domainOwnerGranted: true })) {
    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <mwc-icon>dashboard</mwc-icon> `,
        name: html` <ox-i18n msgid="menu.board-template"></ox-i18n> `,
        action: () => {
          navigate('board-template-list')
        }
      }
    })
  }
}
