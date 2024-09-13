import '@material/web/icon/icon.js'
import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { ButtonContainerStyles } from '@operato/styles'
import { ChecklistTypeMainType, CHECKLIST_MAIN_TYPE_LIST } from '../building-inspection/building-inspection-list'

@customElement('checklist-view')
class ChecklistView extends LitElement {
  static styles = [
    ButtonContainerStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        font-size: 14px;
        padding: 20px;
        overflow-y: auto;
        min-width: 800px;

        background-color: var(--md-sys-color-surface);
      }

      [bold] {
        font-weight: bold;
      }

      div[name] {
        display: flex;
        color: #586878;
        font-size: 24px;
        font-weight: bold;
        align-items: center;
        justify-content: center;
      }

      table {
        width: 100%;
        font-size: 15px;
        color: #586878;
        text-align: left;
        border-collapse: collapse;
        td,
        th {
          border: 1px #999999 solid;
          padding-inline: 8px;
        }
        th {
          background-color: #efefef;
          font-weight: bold;
        }
        td {
          height: 35px;
        }
      }

      table[header] {
        margin-top: 5px;

        td {
          min-width: 180px;
          border-left: none;
        }
        th {
          width: 110px;
          border-right: none;
        }
      }

      table[body] {
        border: 2px solid #999999;
        border-bottom: none;
        margin-top: 10px;

        th {
          text-align: center;

          &[result] {
            width: 270px;
          }
        }
        td {
          &[type] {
            width: 50px;
            text-align: center;
            word-break: keep-all;
          }
        }
      }

      table[tail] {
        border: 2px solid #999999;
        border-top: none;
        margin-top: -1px;

        tr[first] td {
          border-top: none;
        }
        td {
          width: 25%;
          border-left: none;
          text-align: center;
        }
        th {
          width: 25%;
          border-right: none;
        }
      }

      div[footer] {
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 12px;
        margin-top: 10px;
        color: #586878;
        text-indent: -9px;
        padding-left: 9px;
      }
    `
  ]

  @property({ type: String }) checklistName: string = ''
  @property({ type: String }) checklistConstructionType: string = ''
  @property({ type: String }) checklistConstructionDetailType: string = ''
  @property({ type: String }) location: string = ''
  @property({ type: Array }) checklistItem: any = [
    {
      name: '검사 항목1',
      mainType: '10',
      detailType: '상세 구분1',
      sequence: 1
    },
    {
      name: '검사 항목2',
      mainType: '10',
      detailType: '상세 구분2',
      sequence: 2
    },
    {
      name: '검사 항목3검사 항목3검사 항목3검사 항목3검사 항목3검사 항목3검사',
      mainType: '10',
      detailType: '상세 구분3 입니다. 상세해요',
      sequence: 3
    },
    {
      name: '검사 항목3',
      mainType: '20',
      detailType: '상세 구분4',
      sequence: 4
    },
    {
      name: '검사 항목3검사 항목3검사 항목3검사 항목3',
      mainType: '20',
      detailType: '상세 구분5',
      sequence: 5
    }
  ]

  render() {
    const today = this._getToday()
    const mainTypeCount = this.checklistItem?.filter(v => v.mainType === ChecklistTypeMainType.BASIC).length
    console.log('mainTypeCount :', mainTypeCount)

    // 체크리스트 아이템 정렬
    this.checklistItem.sort((a, b) => {
      // 1순위: mainType 오름차순
      if (a.mainType < b.mainType) return -1
      if (a.mainType > b.mainType) return 1

      // 2순위: sequence 오름차순
      return a.sequence - b.sequence
    })

    return html`
      <div wrapper>
        <div name>${this.checklistName}</div>

        <table header>
          <tr>
            <th>공종</th>
            <td>${this.checklistConstructionType}</td>
            <th>문서 번호</th>
            <td></td>
          </tr>
          <tr>
            <th>세부 공종</th>
            <td>${this.checklistConstructionDetailType}</td>
            <th>위치 및 부위</th>
            <td>${this.location}</td>
          </tr>
        </table>

        <table body>
          <thead>
            <tr>
              <th colspan="2" rowspan="3">구분</th>
              <th rowspan="3">검사항목</th>
              <th rowspan="3">검사기준</th>
              <th colspan="4" result>검사결과</th>
              <th rowspan="3">첨부자료</th>
              <th rowspan="3">조치사항</th>
            </tr>
            <tr>
              <th colspan="2">시공자</th>
              <th colspan="2">감리자</th>
            </tr>
            <tr>
              <th>적합</th>
              <th>부적합</th>
              <th>적합</th>
              <th>부적합</th>
            </tr>
          </thead>
          <tbody>
            ${this.checklistItem.map((item, idx) => {
              let basicMainType: any = ''
              if (idx === 0) {
                basicMainType = html` <td type bold rowspan="${mainTypeCount}">${CHECKLIST_MAIN_TYPE_LIST[item.mainType]}</td>`
              }

              let nonBasicMainType: any = ''
              if (idx === mainTypeCount) {
                nonBasicMainType = html` <td type bold rowspan="${this.checklistItem.length - mainTypeCount}">
                  ${CHECKLIST_MAIN_TYPE_LIST[item.mainType]}
                </td>`
              }

              return html` <tr>
                ${basicMainType} ${nonBasicMainType}
                <td bold>${item.detailType}</td>
                <td bold>${idx + 1}. ${item.name}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`
            })}
          </tbody>
        </table>

        <table tail>
          <tbody>
            <tr first>
              <th rowspan="2">시공자점검일</th>
              <td rowspan="2">${today}</td>
              <th>총괄 시공책임자</th>
              <td>(인)</td>
            </tr>
            <tr>
              <th>공종별 시공관리자</th>
              <td>(인)</td>
            </tr>
            <tr>
              <th rowspan="2">시공자점검일</th>
              <td rowspan="2">${today}</td>
              <th>총괄 감리책임자</th>
              <td>(인)</td>
            </tr>
            <tr>
              <th>공종별 감리 책임자</th>
              <td>(인)</td>
            </tr>
          </tbody>
        </table>

        <div footer>
          <div>
            - 검사결과는 1차, 2차로 구분 재검측시 2차에 기록하고 검사기준도 검사결과와 비교될 수 있도록 시방서 또는 도면 등에 있는
            수치를 작성하며, 수치가 없는 검사항목은 시방서 또는 설계도서에 있는 내용과 검사한 내용으로 작성함
          </div>
          <div>- 검사항목 및 검사기준은 각 공종별로 감리원과 협의하여 작성할 것</div>
        </div>
      </div>
    `
  }

  private _getToday() {
    return new Date().toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
