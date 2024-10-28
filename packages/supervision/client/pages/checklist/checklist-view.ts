import '@material/web/icon/icon.js'
import gql from 'graphql-tag'
import { client } from '@operato/graphql'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ButtonContainerStyles, ScrollbarStyles } from '@operato/styles'
import {
  CHECKLIST_MAIN_TYPE_LIST,
  BuildingInspectionStatus,
  BUILDING_INSPECTION_STATUS_DISPLAY
} from '../building-inspection/building-inspection-list'
import '@operato/input/ox-input-signature.js'
import { store } from '@operato/shell'
import { connect } from 'pwa-helpers/connect-mixin.js'
import { openPopup } from '@operato/layout'
import './comment-list-popup'

export const enum ChecklistMode {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR'
}

@customElement('checklist-view')
class ChecklistView extends connect(store)(LitElement) {
  static styles = [
    ButtonContainerStyles,
    ScrollbarStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        font-size: 14px;
        padding: 20px;
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
          vertical-align: middle;
        }
        th {
          background-color: #efefef;
          font-weight: bold;
        }
        td {
          height: 35px;
          &[radio] {
            text-align: center;
            width: 55px;
          }
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

          &[type] {
            min-width: 150px;
          }
          &[inspection-name] {
            min-width: 250px;
          }
          &[result] {
            width: 270px;
          }
          &[criteria] {
            width: 90px;
          }
          &[small] {
            width: 60px;
          }
        }
        td {
          &[main-type] {
            width: 50px;
            text-align: center;
            word-break: keep-all;
          }

          &[attachment] {
            width: 90px;
            text-align: center;
          }
          &[comment] {
            cursor: pointer;
            text-align: center;

            * {
              vertical-align: middle;
            }
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
          position: relative;
        }
        th {
          width: 25%;
          border-right: none;
        }

        span[sign-text] {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        ox-input-signature {
          margin: 10px;

          &[disabled] {
            background: #eee;
          }
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

  @property({ type: String }) mode: ChecklistMode = ChecklistMode.VIEWER
  @property({ type: Object }) checklist: any = {}
  @property({ type: Object }) buildingComplex = {
    id: '',
    taskConstructorEmails: [] as string[],
    overallConstructorEmails: [] as string[],
    taskSupervisoryEmails: [] as string[],
    overallSupervisoryEmails: [] as string[]
  }
  @property({ type: String }) status: BuildingInspectionStatus = BuildingInspectionStatus.WAIT

  render() {
    const today = this._getDate(new Date())

    // 시공자 스탭 여부
    const isConstructorStep =
      this.status == BuildingInspectionStatus.WAIT ||
      this.status == BuildingInspectionStatus.OVERALL_WAIT ||
      this.status == BuildingInspectionStatus.FAIL

    // 감리자 스탭 여부
    const isSupervisoryStep =
      this.status == BuildingInspectionStatus.REQUEST || this.status == BuildingInspectionStatus.OVERALL_REQUEST

    // 현재 스탭에 해당하는 계정인지 체크 (편집모드만)
    let havePermissionByStatus: boolean = false
    let isTaskConstructor: boolean = false
    let isOverallConstructor: boolean = false
    let isTaskSupervisory: boolean = false
    let isOverallSupervisory: boolean = false

    if (this.mode == ChecklistMode.EDITOR && this.status) {
      const email = (store.getState() as any).auth?.user?.email
      // 현재 유저가 "공종별 시공 관리자" 인지 체크
      isTaskConstructor = this.buildingComplex.taskConstructorEmails?.includes(email) || false
      // 현재 유저가 "총괄 시공 책임자" 인지 체크
      isOverallConstructor = this.buildingComplex.overallConstructorEmails?.includes(email) || false
      // 현재 유저가 "공종별 감리 책임자" 인지 체크
      isTaskSupervisory = this.buildingComplex.taskSupervisoryEmails?.includes(email) || false
      // 현재 유저가 "총괄 감리 책임자" 인지 체크
      isOverallSupervisory = this.buildingComplex.overallSupervisoryEmails?.includes(email) || false
      // 스탭이 시공자 스탭일때에 내가 시공자 권한이 있는지 체크
      havePermissionByStatus = isConstructorStep
        ? isTaskConstructor || isOverallConstructor
        : isTaskSupervisory || isOverallSupervisory
    }

    // 체크리스트 아이템 정렬
    this.checklist?.checklistItems?.sort((a, b) => {
      // 1순위: mainType 오름차순
      if (a.mainType < b.mainType) return -1
      if (a.mainType > b.mainType) return 1

      // 2순위: detailType 오름차순
      if (a.detailType < b.detailType) return -1
      if (a.detailType > b.detailType) return 1

      // 3순위: sequence 오름차순
      return a.sequence - b.sequence
    })

    const processedItems = this.drawChecklistItems(this.checklist?.checklistItems || [])

    return html`
      <div wrapper>
        <div name>${this.checklist.name}</div>

        <table header>
          <tr>
            <th>공종</th>
            <td>${this.checklist.constructionType}</td>
            <th>문서 번호</th>
            <td>${this.checklist.documentNo}</td>
          </tr>
          <tr>
            <th>세부 공종</th>
            <td>${this.checklist.constructionDetailType}</td>
            <th>위치 및 부위</th>
            <td>${this.checklist.location}</td>
          </tr>
          <tr>
            <th>검측 부위</th>
            <td>${this.checklist?.inspectionParts?.join(', ') || ''}</td>
            <th>검측 상태</th>
            <td>${BUILDING_INSPECTION_STATUS_DISPLAY[this.checklist?.buildingInspection?.status]}</td>
          </tr>
        </table>

        <table body>
          <thead>
            <tr>
              <th colspan="2" rowspan="3" type>구분</th>
              <th rowspan="3" inspection-name>검사항목</th>
              <th rowspan="3" criteria>검사기준</th>
              <th colspan="4" result>검사결과</th>
              <th rowspan="3" small>첨부자료</th>
              <th rowspan="3" small>조치사항</th>
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
            ${processedItems.map(({ item, showMainTypeCell, mainTypeRowspan, showDetailTypeCell, detailTypeRowspan }, idx) => {
              return html` <tr>
                ${showMainTypeCell
                  ? html`<td main-type bold rowspan="${mainTypeRowspan}">${CHECKLIST_MAIN_TYPE_LIST[item.mainType]}</td>`
                  : ''}
                ${showDetailTypeCell ? html` <td bold rowspan="${detailTypeRowspan}">${item.detailType}</td> ` : ''}

                <td bold>${idx + 1}. ${item.name}</td>
                <td>${item.inspctionCriteria}</td>
                <td radio>
                  <md-radio
                    item-id=${item.id}
                    item-name="constructionConfirmStatus"
                    name=${'radio-construction-' + item.id}
                    value="T"
                    .checked=${item.constructionConfirmStatus === 'T'}
                    ?disabled=${!isConstructorStep || !havePermissionByStatus}
                    @change=${this._onChangeConfirmStatus}
                  ></md-radio>
                </td>
                <td radio>
                  <md-radio
                    item-id=${item.id}
                    item-name="constructionConfirmStatus"
                    name=${'radio-construction-' + item.id}
                    value="F"
                    .checked=${item.constructionConfirmStatus === 'F'}
                    ?disabled=${!isConstructorStep || !havePermissionByStatus}
                    @change=${this._onChangeConfirmStatus}
                  ></md-radio>
                </td>
                <td radio>
                  <md-radio
                    item-id=${item.id}
                    item-name="supervisoryConfirmStatus"
                    name=${'radio-supervisory-' + item.id}
                    value="T"
                    .checked=${item.supervisoryConfirmStatus === 'T'}
                    ?disabled=${!isSupervisoryStep || !havePermissionByStatus}
                    @change=${this._onChangeConfirmStatus}
                  ></md-radio>
                </td>
                <td radio>
                  <md-radio
                    item-id=${item.id}
                    item-name="supervisoryConfirmStatus"
                    name=${'radio-supervisory-' + item.id}
                    value="F"
                    .checked=${item.supervisoryConfirmStatus === 'F'}
                    ?disabled=${!isSupervisoryStep || !havePermissionByStatus}
                    @change=${this._onChangeConfirmStatus}
                  ></md-radio>
                </td>
                <td attachment><md-icon slot="icon">attach_file</md-icon></td>
                <td comment @click=${() => this._onClickComment(item.id)}>
                  <md-icon slot="icon">chat</md-icon>
                  <span>${item?.checklistItemCommentCount || ''}</span>
                </td>
              </tr>`
            })}
          </tbody>
        </table>

        <table tail>
          <tbody>
            <tr first>
              <th rowspan="2">시공자 점검일</th>
              <td rowspan="2">
                ${this.mode == ChecklistMode.VIEWER ? today : this._getDate(this.checklist.constructionInspectionDate)}
              </td>
              <th>공종별 시공 관리자</th>
              <td>
                <span sign-text>(인)</span>
                <ox-input-signature
                  .value=${this.checklist.taskConstructorSignature}
                  name="taskConstructorSignature"
                  @change=${this._onChangeSignature}
                  ?disabled=${(this.status != BuildingInspectionStatus.WAIT && this.status != BuildingInspectionStatus.FAIL) ||
                  !isTaskConstructor}
                >
                </ox-input-signature>
              </td>
            </tr>
            <tr>
              <th>총괄 시공 책임자</th>
              <td>
                <span sign-text>(인)</span>
                <ox-input-signature
                  .value=${this.checklist.overallConstructorSignature}
                  name="overallConstructorSignature"
                  @change=${this._onChangeSignature}
                  ?disabled=${this.status != BuildingInspectionStatus.OVERALL_WAIT || !isOverallConstructor}
                >
                </ox-input-signature>
              </td>
            </tr>
            <tr>
              <th rowspan="2">감리자 점검일</th>
              <td rowspan="2">
                ${this.mode == ChecklistMode.VIEWER ? today : this._getDate(this.checklist.supervisorInspectionDate)}
              </td>
              <th>공종별 감리 책임자</th>
              <td>
                <span sign-text>(인)</span>
                <ox-input-signature
                  .value=${this.checklist.taskSupervisorySignature}
                  name="taskSupervisorySignature"
                  @change=${this._onChangeSignature}
                  ?disabled=${this.status != BuildingInspectionStatus.REQUEST || !isTaskSupervisory}
                >
                </ox-input-signature>
              </td>
            </tr>
            <tr>
              <th>총괄 감리 책임자</th>
              <td>
                <span sign-text>(인)</span>
                <ox-input-signature
                  .value=${this.checklist.overallSupervisorySignature}
                  name="overallSupervisorySignature"
                  @change=${this._onChangeSignature}
                  ?disabled=${this.status != BuildingInspectionStatus.OVERALL_REQUEST || !isOverallSupervisory}
                >
                </ox-input-signature>
              </td>
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

  private _onChangeConfirmStatus(e: Event) {
    const target = e.target as HTMLInputElement
    const itemId = target.getAttribute('item-id')
    const name = target.getAttribute('item-name') || ''
    const value = target.value

    this.checklist.checklistItems = this.checklist?.checklistItems?.map(item =>
      item.id == itemId ? { ...item, [name]: value } : item
    )
  }

  private _onChangeSignature(e: Event) {
    const target = e.target as HTMLInputElement

    this.checklist[target.name] = target.value
  }

  private _getDate(date) {
    if (!date) return ' 년 월 일'

    const _date = new Date(date) || new Date()
    return _date.toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  private drawChecklistItems(checklistItems) {
    const mainTypeRowspans = {}
    const detailTypeRowspans = {}
    let previousMainType = null
    let previousDetailType = null

    return checklistItems.map((item, index) => {
      const mainType = item.mainType
      const detailType = item.detailType

      // mainType이 변경되면 rowspan을 계산
      if (mainType !== previousMainType) {
        mainTypeRowspans[mainType] = checklistItems.filter(i => i.mainType === mainType).length
        previousDetailType = null // detailType 초기화
      }

      // detailType이 변경되면 rowspan을 계산
      if (detailType !== previousDetailType) {
        detailTypeRowspans[`${mainType}-${detailType}`] = checklistItems.filter(
          i => i.mainType === mainType && i.detailType === detailType
        ).length
      }

      const showMainTypeCell = mainType !== previousMainType
      const showDetailTypeCell = detailType !== previousDetailType

      const mainTypeRowspan = mainTypeRowspans[mainType]
      const detailTypeRowspan = detailTypeRowspans[`${mainType}-${detailType}`]

      // 이전 값을 업데이트
      previousMainType = mainType
      previousDetailType = detailType

      return {
        item,
        showMainTypeCell,
        mainTypeRowspan,
        showDetailTypeCell,
        detailTypeRowspan
      }
    })
  }

  private _onClickComment(checklistItemId: string) {
    openPopup(
      html`
        <comment-list-popup
          .checklistItemId=${checklistItemId}
          @change-comment=${this._refreshComment.bind(this)}
        ></comment-list-popup>
      `,
      {
        backdrop: true,
        size: 'medium',
        title: '조치사항'
      }
    )
  }

  private async _refreshComment(e) {
    const { checklistItemId } = e.detail
    const response = await client.query({
      query: gql`
        query ChecklistItem($checklistItemId: String!) {
          checklistItem(id: $checklistItemId) {
            id
            checklistItemCommentCount
          }
        }
      `,
      variables: {
        checklistItemId: checklistItemId
      }
    })

    const checklistItemCommentCount = response.data?.checklistItem?.checklistItemCommentCount || []
    this.checklist.checklistItems = this.checklist.checklistItems.map(item => {
      return item.id != checklistItemId ? item : { ...item, checklistItemCommentCount: checklistItemCommentCount }
    })

    this.requestUpdate()
  }
}
