/**
 * @license Copyright © HatioLab Inc. All rights reserved.
 */

import { PropertyValues, LitElement, css, html } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { ScrollbarStyles } from '@operato/styles'

/**
WEB Component for code-mirror code editor.

Example:
  <ox-progress-circle
    .value=${70}
    title="전체"
    suffix="%"
    fontSize="29px"
    fontColor="#4E5055"
    borderStyle="none"
    innerCircleSize="28%"
    circleColor="#0595E5"
    shadow="#00000026 4px 4px 4px"
    background="#eaf5fd"
  ></ox-progress-circle>
*/
@customElement('ox-progress-circle')
export class OxProgressCircle extends LitElement {
  static styles = [
    ScrollbarStyles,
    css`
      :host {
        display: flex;
      }

      div[circle] {
        font-size: 29px;
        font-weight: bold;
        width: 100%;
        aspect-ratio: 1;
        display: flex;
        border-radius: 50%;
        border: 1px solid #353b48;
        position: relative;
        background: conic-gradient(yellowgreen 0deg, white 0deg);
        box-shadow: #00000026 5px 5px 5px;
      }
      div[inner-circle] {
        width: 90%;
        aspect-ratio: 1;
        border-radius: inherit;
        background-color: #353b48;
        margin: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: white;
        justify-content: center;
        box-shadow: inset #00000026 -2px 2px 8px;
      }

      div[inner-circle] span {
        display: flex;
        align-items: center;
      }

      span[progress-title] {
        font-size: 0.65em;
        margin-bottom: -5%;
      }
    `
  ]

  @property({ type: Number }) value: number = 0
  @property({ type: String }) suffix: string = ''
  @property({ type: String }) title: string = ''
  @property({ type: String }) fontSize: string = '10px'
  @property({ type: String }) fontColor: string = ''
  @property({ type: String }) borderStyle: string = ''
  @property({ type: String }) innerCircleSize: string = '10%'
  @property({ type: String }) shadow: string = ''
  @property({ type: String }) circleColor: string = 'yellowgreen'
  @property({ type: String }) background: string = ''

  @query('div[circle]') circle!: HTMLDivElement
  @query('div[inner-circle]') innerCircle!: HTMLDivElement
  @query('span[progress-title]') progressTitle?: HTMLSpanElement

  firstUpdated() {
    if (this.fontSize) {
      this.circle.style.fontSize = this.fontSize
    }
    if (this.fontColor) {
      this.innerCircle.style.color = this.fontColor
    }
    if (this.borderStyle) {
      this.circle.style.border = this.borderStyle
    }
    if (this.innerCircleSize) {
      this.innerCircle.style.width = `calc(100% - ${this.innerCircleSize})`
    }
    if (this.shadow) {
      this.circle.style.boxShadow = this.shadow
    }
    if (this.background) {
      this.innerCircle.style.background = this.background
    }
    if (this.progressTitle && this.circleColor) {
      this.progressTitle.style.color = this.circleColor
    }
  }

  updated(changes: PropertyValues<this>) {
    if (changes.has('value')) {
      this.updateCircleBackground()
    }
  }

  updateCircleBackground() {
    const position = this.value * 3.6 // 360 = 100%
    this.circle.style.background = `conic-gradient(${this.circleColor} ${position}deg, ${this.background} 0deg)`
  }

  render() {
    return html`
      <div circle>
        <div inner-circle>
          ${this.title ? html`<span progress-title>${this.title}</span>` : ''}
          <span>${this.value}${this.suffix}</span>
        </div>
      </div>
    `
  }
}
