import '@material/web/icon/icon.js'
import { css, html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { ButtonContainerStyles, ScrollbarStyles } from '@operato/styles'

@customElement('file-preview-popup')
class FilePreviewPopup extends LitElement {
  static styles = [
    ButtonContainerStyles,
    ScrollbarStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        padding: 15px 20px;
        overflow-y: auto;
        background-color: var(--md-sys-color-surface);
      }

      .modal-content {
        margin: 5% auto;
        width: 90%;
        background-color: white;
        text-align: center;
      }
    `
  ]

  @property({ type: String }) filepath: string = ''

  @query('#previewContent') previewContent!: HTMLDivElement

  render() {
    return html` <div class="modal-content" id="previewContent"></div>`
  }

  async firstUpdated() {
    this.showPreview(this.filepath)
  }

  showPreview(fileUrl) {
    // 파일 확장자 확인
    const fileExtension = fileUrl.split('.').pop().toLowerCase()
    this.previewContent.innerHTML = ''

    console.log(fileExtension)

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      // 이미지 미리보기
      const img = document.createElement('img')
      img.src = fileUrl
      img.alt = '미리보기 이미지'
      img.style.width = '100%'
      this.previewContent.appendChild(img)
    } else if (fileExtension === 'pdf') {
      // PDF 미리보기
      const iframe = document.createElement('iframe')
      iframe.src = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=0` // 툴바, 내비게이션 및 스크롤바 숨기기
      iframe.style.width = '100%'
      iframe.style.height = '100vh'
      iframe.style.border = 'none'
      this.previewContent.appendChild(iframe)
    } else {
      // 미리보기가 지원되지 않는 파일 형식 안내
      const message = document.createElement('p')
      message.innerText = '미리보기가 지원되지 않는 파일 형식입니다.'
      this.previewContent.appendChild(message)
    }
  }
}
