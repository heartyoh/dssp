import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { connect } from 'pwa-helpers/connect-mixin.js'
import { store, PageView } from '@operato/shell'

const logo = new URL('/assets/images/hatiolab-logo.png', import.meta.url).href

@customElement('supervision-main')
class SupervisionMain extends connect(store)(PageView) {
  @property({ type: String }) supervision?: string

  render() {
    return html`
      <section>
        <h2>Supervision</h2>
        <img src=${logo}>
      </section>
    `
  }

  stateChanged(state) {
    this.supervision = state.supervision.state_main
  }
}

