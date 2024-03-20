import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { connect } from 'pwa-helpers/connect-mixin.js'
import { store, PageView } from '@operato/shell'

const logo = new URL('/assets/images/hatiolab-logo.png', import.meta.url).href

@customElement('complex-main')
class ComplexMain extends connect(store)(PageView) {
  @property({ type: String }) complex?: string

  render() {
    return html`
      <section>
        <h2>Complex</h2>
        <img src=${logo}>
      </section>
    `
  }

  stateChanged(state) {
    this.complex = state.complex.state_main
  }
}

