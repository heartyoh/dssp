import ExcelJS from 'exceljs'
import { RawTask } from './types'
import { Project } from '../service/project/project'
import { importTasks } from './import-task'

export async function parseExcelAndImportTasks(buffer: Buffer, project: Project, context: ResolverContext) {
  // 1. 엑셀 파일을 읽어들입니다.
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  // 2. 첫 번째 워크시트를 가져옵니다.
  const worksheet = workbook.getWorksheet(1) // Index or sheet name can be used

  // 3. 첫 번째 row를 header로 사용합니다.
  const headers: string[] = []
  let taskCodeColumnIndex = -1

  const headerRow = worksheet.getRow(1)
  headerRow.eachCell((cell, colNumber) => {
    const headerText = cell.text.toString()
    headers[colNumber - 1] = headerText // Store headers in an array

    if (headerText === '작업코드') {
      taskCodeColumnIndex = colNumber // Store the column index for "작업코드"
    }
  })

  if (taskCodeColumnIndex === -1) {
    throw new Error('작업코드 column not found')
  }

  // 4. 엑셀 데이터를 RawTask 형식으로 변환합니다.
  const tasks: RawTask[] = []

  // Start processing from the second row onward to skip the header
  for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
    const row = worksheet.getRow(rowIndex)
    const taskData: any = {}

    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1]

      // Check if the cell has a formula(or sharedFormula) and use the formula result
      let cellValue: any = cell.value
      if (cellValue && typeof cellValue === 'object' && ('formula' in cellValue || 'sharedFormula' in cellValue)) {
        // Cell contains a formula, use the calculated result if available
        cellValue = cellValue.result ?? cellValue.value // Use the result, or fallback to value if result is not calculated
      }

      taskData[header] = cellValue
    })

    const taskCodeCell = row.getCell(taskCodeColumnIndex)
    let bgColor = '#FFFFFF'
    const fill = taskCodeCell.style.fill

    if (fill && fill.type === 'pattern' && fill.pattern === 'solid') {
      const fgColor = fill.fgColor
      if (fgColor && fgColor.argb) {
        // ARGB is a color in the format AARRGGBB, remove the alpha channel (first two characters)
        bgColor = `#${fgColor.argb.slice(2)}`
      }
    }

    const task: RawTask = {
      code: taskData['작업코드'],
      title: taskData['작업명'],
      type: taskData['세부공종'],
      duration: taskData['기간'],
      startDate: taskData['시작일'],
      dependsOn: taskData['선행작업코드'],
      progress: taskData['진척율'],
      tags: taskData['Tags'] ? taskData['Tags'].split(',') : [],
      resources: taskData['Resources'] ? JSON.parse(taskData['Resources']) : [],
      style: bgColor,
      children: []
    }

    if (task.code && task.type) {
      tasks.push(task)
    }
  }

  // 5. 변환된 데이터를 importTasks 함수로 전달합니다.
  await importTasks(project, tasks, context)
}
