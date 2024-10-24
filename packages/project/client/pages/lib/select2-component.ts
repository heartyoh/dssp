import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('select2-component')
export class Select2Component extends LitElement {
  static styles = css`
    div[select-container] {
      position: relative;
      border: 1px solid rgba(51,51,51,.20);
      border-radius: 5px;
      padding: var(--spacing-small, 4px) var(--spacing-medium, 8px);
      font-size: 14px;
      color: var(--md-sys-color-primary);
    }
    div[select-container]:focus {
      border: 1px solid #1f7fd9;
    }

    div[dropdown] {
      border: 1px solid #ccc;
      padding: var(--spacing-small, 4px);
      cursor: pointer;
    }

    div[options] {
      position: absolute;
      left: 0;
      top: 30px;
      min-width: 50%;
      border: 1px solid #ccc;
      background-color: var(--md-sys-color-surface-tint);
      color:var(--md-sys-color-on-primary);
      max-height: 150px;
      overflow-y: auto;
      display: block;
      z-index: 1;
    }

    div[option] {
      padding: var(--spacing-small, 4px) var(--spacing-medium, 8px);
      cursor: pointer;
      border-bottom: 1px solid rgba(0,0,0,.4);
    }
    div[option]:last-child {
      border-bottom: none;
    }

    div[option]:hover {
      background-color: var(--md-sys-color-tertiary-container);
    }

    div[option][selected] {
      background-color: var(--md-sys-color-tertiary-container);
      font-weight: bold;
      color:var(--md-sys-color-on-primary);
    }

    div[selected-tags] {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-small, 4px);
      margin-top: var(--spacing-small, 4px);
    }

    div[tag] {
      background-color: #2e79be;
      color: white;
      padding: var(--spacing-tiny, 2px) var(--spacing-medium, 8px);
      border-radius: 20px;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }

    span[tag-close] {
      margin-left: var(--spacing-small, 4px);
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
