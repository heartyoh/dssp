import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

const userIcon = new URL('../../assets/images/user.png', import.meta.url).href

@customElement('user-circle')
export class UserCircle extends LitElement {
  static styles = [
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

  render() {
    return html` <img src=${userIcon} class="user" /> `
  }
}
