import * as XLSX from 'xlsx'

import { RawTask } from './types'

import { Project } from '../service/project/project'
import { importTasks } from './import-task'

// 엑셀 파일을 파싱하는 함수
export async function parseExcelAndImportTasks(buffer: Buffer, project: Project, context: ResolverContext) {
  // 1. 엑셀 파일을 읽어들입니다.
  const workbook = XLSX.read(buffer, { type: 'buffer' })

  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // 2. 엑셀 데이터를 JSON 형태로 변환합니다.
  const jsonData = XLSX.utils.sheet_to_json(sheet)

  // 3. 엑셀 데이터를 RawTask 형식으로 변환합니다.
  const tasks: RawTask[] = jsonData.map((row: any) => ({
    code: row['작업코드'], // 엑셀의 Code 열
    title: row['작업명'], // 엑셀의 Title 열
    type: row['세부공종'], // 엑셀의 Type 열 (GROUP/TASK)
    duration: row['기간'], // 엑셀의 Duration 열
    startDate: row['시작일'], // 엑셀의 StartDate 열 (YYYY-MM-DD 형식)
    dependsOn: row['종료일'], // 엑셀의 DependsOn 열 (이전에 의존하는 작업)
    progress: row['진척율'], // 엑셀의 Progress 열
    tags: row['Tags'] ? row['Tags'].split(',') : [], // 엑셀의 Tags 열, 콤마로 구분된 태그
    resources: row['Resources'] ? JSON.parse(row['Resources']) : [], // 엑셀의 Resources 열 (JSON 형태로 입력)
    children: [] // 자식 태스크는 이후 처리
    // code: row['Code'], // 엑셀의 Code 열
    // title: row['Title'], // 엑셀의 Title 열
    // type: row['Type'], // 엑셀의 Type 열 (GROUP/TASK)
    // duration: row['Duration'], // 엑셀의 Duration 열
    // startDate: row['StartDate'], // 엑셀의 StartDate 열 (YYYY-MM-DD 형식)
    // dependsOn: row['DependsOn'], // 엑셀의 DependsOn 열 (이전에 의존하는 작업)
    // progress: row['Progress'], // 엑셀의 Progress 열
    // tags: row['Tags'] ? row['Tags'].split(',') : [], // 엑셀의 Tags 열, 콤마로 구분된 태그
    // resources: row['Resources'] ? JSON.parse(row['Resources']) : [], // 엑셀의 Resources 열 (JSON 형태로 입력)
    // children: [] // 자식 태스크는 이후 처리
  }))

  // 4. 변환된 데이터를 importTasks 함수로 전달합니다.
  await importTasks(project, tasks, context)
}
