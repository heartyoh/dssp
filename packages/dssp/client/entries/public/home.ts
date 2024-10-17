import '@material/web/icon/icon.js'

import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('home-page')
export class HomePage extends LitElement {
  static styles = [
    css`
      :host {
        background-color: var(--md-sys-color-background);

        display: block;
        position: relative;

        max-width: 100vw;
        width: 100vw;
        height: 100vh;
        height: 100dvh;
      }

      [signin] {
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 2em;
        color: white;
      }

      [message] {
        background-color: rgba(50, 66, 97, 0.8);
        padding: 60px 50px 0 50px;
        color: #fff;
        text-align: center;
        font-size: 20px;
      }

      [message] strong {
        display: block;
        font-size: 2.5rem;
      }

      video {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        transform: translate(-50%, -50%);
      }

      @media screen and (max-width: 480px) {
        [message] {
          padding: 60px 30px 0 30px;
          color: #fff;
          text-align: center;
          font-size: 15px;
        }

        [message] strong {
          font-size: 1.6rem;
        }
      }
    `
  ]

  private _applicationMeta

  render() {
    var { title, description } = this.applicationMeta

    return html`
      <div message>
        <strong>${title}</strong>
        ${description}
        <video autoplay muted playsinline loop>
          <source src="/assets/videos/intro.mp4" type="video/mp4" />
        </video>
      </div>

      <md-icon signin @click=${e => (window.location.href = '/auth/signin')}>login</md-icon>
    `
  }

  get applicationMeta() {
    if (!this._applicationMeta) {
      var iconLink = document.querySelector('link[rel="application-icon"]') as HTMLLinkElement
      var titleMeta = document.querySelector('meta[name="application-name"]') as HTMLMetaElement
      var descriptionMeta = document.querySelector('meta[name="application-description"]') as HTMLMetaElement

      this._applicationMeta = {
        icon: iconLink?.href,
        title: titleMeta?.content || 'Things Factory',
        description: descriptionMeta?.content || 'Reimagining Software'
      }
    }

    return this._applicationMeta
  }
}
