import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('select2-component')
export class Select2Component extends LitElement {
  static styles = css`
    div[select-container] {
      position: relative;
      width: 300px;
      border: 1px solid #000;
      border-radius: 6px;
      padding: 4px 16px;
      font-size: 14px;
      color: var(--md-sys-color-primary);
    }

    div[dropdown] {
      border: 1px solid #ccc;
      padding: 5px;
      cursor: pointer;
    }

    div[options] {
      position: absolute;
      left: 0;
      top: 30px;
      width: 100%;
      border: 1px solid #ccc;
      background-color: white;
      max-height: 150px;
      overflow-y: auto;
      display: block;
      z-index: 1;
    }

    div[option] {
      padding: 10px;
      cursor: pointer;
      border-bottom: 1px solid #ccc;
    }
    div[option]:last-child {
      border-bottom: none;
    }

    div[option]:hover {
      background-color: #f0f0f0;
    }

    div[option][selected] {
      background-color: #d3f9d8;
    }

    div[selected-tags] {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 10px;
    }

    div[tag] {
      background-color: #2e79be;
      color: white;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }

    span[tag-close] {
      margin-left: 8px;
    }
  `

  @property({ type: String }) placeholder: string = ''
  @property({ type: Array }) options: Array<{ name: string; value: string }> = []
  @property({ type: Array }) selectedValues: string[] = []

  @state() showOptions: boolean = false

  get selectedItems() {
    return this.selectedValues.map(id => this.options.find(option => option.value === id)).filter(Boolean)
  }

  connectedCallback() {
    super.connectedCallback()
    document.addEventListener('click', this._handleOutsideClick)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('click', this._handleOutsideClick)
  }

  private _handleOutsideClick = (event: MouseEvent) => {
    const path = event.composedPath()
    if (!path.includes(this)) {
      this.showOptions = false
    }
  }

  private _toggleOptions() {
    this.showOptions = !this.showOptions
  }

  private _handleSelect(optionValue: string) {
    if (this.selectedValues.includes(optionValue)) {
      // 이미 선택된 옵션을 선택한 경우 해제
      this.selectedValues = this.selectedValues.filter(value => value !== optionValue)
    } else {
      // 선택되지 않은 옵션 추가
      this.selectedValues = [...this.selectedValues, optionValue]
    }

    this.showOptions = false
    this._dispatchEvent(this.selectedValues)
  }

  private _handleRemove(tagValue: string) {
    this.selectedValues = this.selectedValues.filter(value => value !== tagValue)
    this._dispatchEvent(this.selectedValues)
  }

  private _dispatchEvent(selectedValues: string[]) {
    this.dispatchEvent(
      new CustomEvent('selection-changed', {
        detail: { selectedValues }, // ID 배열을 부모로 전달
        bubbles: true,
        composed: true
      })
    )
  }

  render() {
    return html`
      <div select-container>
        <div tags @click="${this._toggleOptions}">${this.placeholder}</div>
        ${this.showOptions
          ? html`
              <div options>
                ${this.options.map(
                  option => html`
                    <div
                      option
                      ?selected=${this.selectedValues.includes(option.value)}
                      @click=${() => this._handleSelect(option.value)}
                    >
                      ${option.name}
                    </div>
                  `
                )}
              </div>
            `
          : ''}
      </div>

      <div selected-tags>
        ${this.selectedItems.map(
          (tag: any) => html`
            <div tag @click=${() => this._handleRemove(tag.value)}>
              ${tag!.name}
              <span tag-close>&times;</span>
            </div>
          `
        )}
      </div>
    `
  }
}
