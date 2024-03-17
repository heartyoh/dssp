import { LitElement, html, css } from 'lit'

export class UserCircle extends LitElement {
  static get properties() {
    return {}
  }

  static get styles() {
    return [
      css`
        img {
          display: block;
          width: 36px;
          height: 36px;
          border-radius: 50%;

          object-fit: cover;
        }
      `
    ]
  }

  render() {
    return html` <img src="/assets/images/user.png" class="user" /> `
  }
}

customElements.define('user-circle', UserCircle)
