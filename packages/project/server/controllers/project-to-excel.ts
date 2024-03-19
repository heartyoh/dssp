import { Workbook, Worksheet } from 'exceljs'

export interface Task {
  name: string
  startDate: Date
  endDate: Date
  subtasks?: Task[]
}

function createGanttChart(tasks: Task[], worksheet: Worksheet, level: number = 0) {
  tasks.forEach(task => {
    const row = worksheet.addRow([task.name, task.startDate, task.endDate])

    row.outlineLevel = level

    row.font = { bold: true }

    if (task.subtasks && task.subtasks.length > 0) {
      createGanttChart(task.subtasks, worksheet, level + 1)
    }
  })

  if (level > 0) {
    const addendum = worksheet.addRow(['sum', level - 1])
    addendum.outlineLevel = level - 1
  }
}

export async function generateExcel(tasks: Task[]) {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('Gantt Chart')

  worksheet.columns = [
    { header: 'Task Name', key: 'name', width: 30 },
    { header: 'Start Date', key: 'startDate', width: 20 },
    { header: 'End Date', key: 'endDate', width: 20 }
  ]

  createGanttChart(tasks, worksheet)

  return await workbook.xlsx.writeBuffer()
}
