import { BizEvent, CALENDAR, EventProvider } from '@operato/event-view'
import { html, TemplateResult } from 'lit'
import gql from 'graphql-tag'
import { client } from '@operato/graphql'

export class InspectionEventProvider implements EventProvider {
  buildingLevelId = {}

  constructor(buildingLevelId: string = '') {
    this.buildingLevelId = buildingLevelId
  }

  async fetchEventsForCalendar(calendar: CALENDAR): Promise<Map<Date, BizEvent[]>> {
    const result = new Map<Date, BizEvent[]>()
    const startDate = calendar[0]['date'].toISOString().split('T')[0]
    const endDate = calendar.at(-1)?.['date'].toISOString().split('T')[0]

    const response = await client.query({
      query: gql`
        query BuildingInspectionDateSummaryOfLevelAndPeriod($buildingLevelId: String!, $startDate: String!, $endDate: String!) {
          buildingInspectionDateSummaryOfLevelAndPeriod(
            buildingLevelId: $buildingLevelId
            startDate: $startDate
            endDate: $endDate
          ) {
            requestDate
            wait
            request
            pass
            fail
          }
        }
      `,
      variables: {
        buildingLevelId: this.buildingLevelId,
        startDate,
        endDate
      }
    })

    // if (response.errors) return null

    const calendarData = this.getCalendarTemplate(response.data?.buildingInspectionDateSummaryOfLevelAndPeriod)

    calendar.forEach(({ date }) => {
      const formattedDate = date.toLocaleDateString('en-CA') // 'en-CA'는 'YYYY-MM-DD' 형식으로 반환됩니다.
      const template = calendarData[formattedDate]

      if (!template) return

      result.set(date, [
        {
          due: formattedDate,
          template: template,
          title: '',
          color: '',
          clickEvent: e => console.log('e :', e, template)
        }
      ])
    })

    return result
  }

  // 검측 개수가 있는 데이터들만 날짜별로 템플릿 만들기
  private getCalendarTemplate(inspectionData: any[] = []): { [date: string]: TemplateResult } {
    const template = {}
    for (let date of inspectionData) {
      template[date.requestDate] = html`
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); padding-inline: 7px;">
          ${date.wait !== 0 ? html`<div><span style="font-size: 1.3em; color: #4e5055">●</span> ${date.wait}</div>` : ''}
          ${date.request !== 0 ? html`<div><span style="font-size: 1.3em; color: #3395f1">●</span> ${date.request}</div>` : ''}
          ${date.pass !== 0 ? html`<div><span style="font-size: 1.3em; color: #1bb401">●</span> ${date.pass}</div>` : ''}
          ${date.fail !== 0 ? html`<div><span style="font-size: 1.3em; color: #ff4444">●</span> ${date.fail}</div>` : ''}
        </div>
      `
    }

    return template
  }
}
