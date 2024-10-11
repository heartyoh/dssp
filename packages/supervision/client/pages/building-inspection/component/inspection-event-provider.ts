import { BizEvent, CALENDAR, EventProvider } from '@operato/event-view'

export class InspectionEventProvider implements EventProvider {
  calendarData = {}

  constructor(calendarData = {}) {
    this.calendarData = calendarData
  }

  fetchEventsForCalendar(calendar: CALENDAR) {
    const result = new Map<Date, BizEvent[]>()

    calendar.forEach(({ date }) => {
      const formattedDate = date.toISOString().split('T')[0]
      const template = this.calendarData[formattedDate]

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
}
