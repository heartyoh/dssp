import '@things-factory/notification/dist-client' /* for notification-setting-let */
import '@things-factory/setting-ui/dist-client' /* for theme-mode-setting-let */

import '@material/web/icon/icon.js'
import '@operato/i18n/ox-i18n.js'
import '@things-factory/notification'
import './viewparts/user-circle'
import './viewparts/menu-tools'

import { html } from 'lit-html'

import { registerDefaultGroups } from '@operato/board'
import { navigate, store } from '@operato/shell'

import { appendViewpart, updateViewpart, toggleOverlay, TOOL_POSITION, VIEWPART_LEVEL, VIEWPART_POSITION } from '@operato/layout'
import { APPEND_APP_TOOL } from '@things-factory/apptool-base/client'
import { setupAppToolPart } from '@things-factory/apptool-ui/dist-client'
import { setupContextUIPart } from '@things-factory/context-ui/dist-client'
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

  await setupContextUIPart({
    titlebar: 'header',
    contextToolbar: 'page-footer'
  })

  /* append top-menu to layout */
  var state = store.getState() as any
  var width = state.layout?.width || 'WIDE'

  appendViewpart({
    name: 'dssp-topmenu',
    viewpart: {
      show: true,
      template: html` <menu-tools></menu-tools> `
    },
    position: width == 'WIDE' ? VIEWPART_POSITION.NAVBAR : VIEWPART_POSITION.FOOTERBAR
  })

  store.subscribe(async () => {
    var state = store.getState() as any

    if (state.layout.width == width) {
      return
    }

    width = state.layout.width

    updateViewpart('dssp-topmenu', {
      position: width == 'WIDE' ? VIEWPART_POSITION.NAVBAR : VIEWPART_POSITION.FOOTERBAR,
      level: VIEWPART_LEVEL.TOPMOST
    })
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

  /* add setting morenda */
  store.dispatch({
    type: ADD_MORENDA,
    morenda: {
      icon: html` <md-icon>settings</md-icon> `,
      name: html` <ox-i18n msgid="label.setting"></ox-i18n> `,
      action: () => {
        navigate('setting')
      }
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
        icon: html` <md-icon>vpn_key</md-icon> `,
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
        icon: html` <md-icon>font_download</md-icon> `,
        name: html` <ox-i18n msgid="menu.fonts"></ox-i18n> `,
        action: () => {
          navigate('font-list')
        }
      }
    })

    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <md-icon>dvr</md-icon> `,
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
        icon: html` <md-icon>attachment</md-icon> `,
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
        icon: html` <md-icon>dashboard</md-icon> `,
        name: html` <ox-i18n msgid="menu.board-template"></ox-i18n> `,
        action: () => {
          navigate('board-template-list')
        }
      }
    })
  }

  if (
    await hasPrivilege({
      domainOwnerGranted: true,
      superUserGranted: true
    })
  ) {
    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <md-icon>code</md-icon> `,
        name: html` <ox-i18n msgid="title.code-management"></ox-i18n> `,
        action: () => {
          navigate('codes')
        }
      }
    })

    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <md-icon>contacts</md-icon> `,
        name: html` <ox-i18n msgid="title.contact list"></ox-i18n> `,
        action: () => {
          navigate('contact-list')
        }
      }
    })

    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <md-icon>account_tree</md-icon> `,
        name: html` <ox-i18n msgid="title.department list"></ox-i18n> `,
        action: () => {
          navigate('department-list')
        }
      }
    })

    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <md-icon>badge</md-icon> `,
        name: html` <ox-i18n msgid="title.employee list"></ox-i18n> `,
        action: () => {
          navigate('employee-list')
        }
      }
    })
  }

  if (await hasPrivilege({ privilege: 'mutation', category: 'terminology', domainOwnerGranted: true })) {
    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <md-icon>translate</md-icon> `,
        name: html` <ox-i18n msgid="title.terminology"></ox-i18n> `,
        action: () => {
          navigate('terminology-page')
        }
      }
    })
  }

  if (
    await hasPrivilege({
      privilege: 'mutation',
      category: 'scenario',
      domainOwnerGranted: true,
      superUserGranted: true
    })
  ) {
    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <md-icon>device_hub</md-icon> `,
        name: html` <ox-i18n msgid="text.connection"></ox-i18n> `,
        action: () => {
          navigate('connection')
        }
      }
    })

    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <md-icon>format_list_numbered</md-icon> `,
        name: html` <ox-i18n msgid="text.scenario"></ox-i18n> `,
        action: () => {
          navigate('scenario')
        }
      }
    })

    store.dispatch({
      type: ADD_MORENDA,
      morenda: {
        icon: html` <md-icon>hub</md-icon> `,
        name: html` <ox-i18n msgid="text.integration analysis"></ox-i18n>&nbsp;(beta)`,
        action: () => {
          navigate('integration-analysis')
        }
      }
    })
  }

  store.dispatch({
    type: ADD_SETTING,
    setting: {
      seq: 10,
      template: html` <theme-mode-setting-let></theme-mode-setting-let> `
    }
  })

  store.dispatch({
    type: ADD_SETTING,
    setting: {
      seq: 20,
      template: html` <notification-setting-let></notification-setting-let> `
    }
  })
}
