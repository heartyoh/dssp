import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { createAttachment, deleteAttachmentsByRef, ATTACHMENT_PATH } from '@things-factory/attachment-base'
import { Project } from './project'
import { NewProject, ProjectPatch } from './project-type'
import { BuildingComplex, Building, BuildingLevel } from '@dssp/building-complex'

const puppeteer = require('puppeteer')
const { Readable } = require('stream')
const ejs = require('ejs')

@Resolver(Project)
export class ProjectMutation {
  @Directive('@transaction')
  @Mutation(returns => Project, { description: '프로젝트 생성' })
  async createProject(@Arg('project') project: NewProject, @Ctx() context: ResolverContext): Promise<Project> {
    const { domain, user, tx } = context.state
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)

    const newBuildingComplex = await buildingComplexRepo.save({
      domain,
      creator: user,
      updater: user
    })

    const result = await projectRepo.save({
      name: project.name,
      buildingComplex: newBuildingComplex,
      domain,
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Project, { description: '프로젝트 업데이트' })
  async updateProject(@Arg('project') project: ProjectPatch, @Ctx() context: ResolverContext): Promise<Project> {
    const { user, tx } = context.state
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)
    const buildingRepo = tx.getRepository(Building)
    const buildingLevelRepo = tx.getRepository(BuildingLevel)

    const buildingComplex = project.buildingComplex
    const buildings = project.buildingComplex?.buildings || []

    // 1. 프로젝트 수정
    const projectResult = await projectRepo.save({ ...project, updater: user })

    // 2. 단지 정보 수정
    await buildingComplexRepo.save({ ...buildingComplex, updater: user })

    // 2-1. 프로젝트 메인 이미지 첨부파일 나머지 삭제 후 저장
    await createAttachmentAfterDelete(context, project?.mainPhotoUpload, project.id, Project.name)

    // 2-2. 단지 BIM 이미지 첨부파일 나머지 삭제 후 저장
    await createAttachmentAfterDelete(context, buildingComplex?.drawingUpload, buildingComplex.id, BuildingComplex.name)

    // 3. 동의 층 정보가 바뀌었으면 층 초기화 후 다시 생성
    const originBuilding = await buildingRepo.findBy({ buildingComplex: { id: buildingComplex.id } }) // 이전 동 정보 가져오기
    const afterBuilding = buildings.reduce((acc, building) => ({ ...acc, [building.name]: building.floorCount }), {}) // 비교용으로 수정된 동 정보 데이터 파싱
    const isBuidlingChanged = originBuilding.some(building => afterBuilding[building.name] !== building.floorCount) // 층 개수가 달라진 동이 있는지 확인

    // 동의 층 개수가 달라지면 모든 층의 데이터 제거 후 생성
    if (isBuidlingChanged || originBuilding.length !== buildings.length) {
      // 3-1. 기존 동/층 첨부파일 및 데이터 제거
      const buildingIds = originBuilding.map((building: Building) => building.id)
      const buildingLevels = await buildingLevelRepo.findBy({ building: { id: In(buildingIds) } })
      const buildingLevelIds = buildingLevels.map((buildingLevel: BuildingLevel) => buildingLevel.id)

      await buildingLevelRepo.softDelete({ building: { id: In(buildingIds) } })
      await buildingRepo.softDelete({ id: In(buildingIds) })
      await deleteAttachmentsByRef(null, { refBys: [...buildingIds, ...buildingLevelIds] }, context)

      buildings.forEach(async (building: Building) => {
        // 3-2. 단지 내 동 정보들 생성
        const newBuilding = await buildingRepo.save({
          buildingComplex: buildingComplex,
          name: building.name,
          floorCount: building.floorCount,
          creator: user
        })

        // 3-3. 동별로 for문 돌면서 층 데이터 개수대로 생성
        for (let i = 1; i <= building.floorCount; i++) {
          await buildingLevelRepo.save({ building: newBuilding, floor: i, creator: user })
        }
      })
    }

    return projectResult
  }

  @Directive('@transaction')
  @Mutation(returns => Project, { description: '프로젝트 도면 업데이트' })
  async updateProjectPlan(@Arg('project') project: ProjectPatch, @Ctx() context: ResolverContext): Promise<Project> {
    const { user, tx, domain } = context.state
    const projectRepo = tx.getRepository(Project)
    const buildingComplexRepo = tx.getRepository(BuildingComplex)
    const buildingComplex = project.buildingComplex
    const buildings: Building[] = project.buildingComplex?.buildings || []

    // 1. 프로젝트 수정 시간 업데이트
    const projectResult = await projectRepo.save({ ...project, updater: user })

    // 2. 단지 축척 정보 수정
    await buildingComplexRepo.save({ ...buildingComplex, updater: user })

    for (let buildingKey in buildings) {
      const building = buildings[buildingKey]

      for (let buildingLevelKey in building.buildingLevels) {
        const buildingLevel = building.buildingLevels[buildingLevelKey]

        // 3. 층별 도면 이미지 저장
        const mainDrawingAttatchment = await createAttachmentAfterDelete(
          context,
          buildingLevel?.mainDrawingUpload,
          buildingLevel.id,
          BuildingLevel.name
        )

        // 첨부된 PDF가 있으면 PDF 파일대로 썸네일 생성
        if (mainDrawingAttatchment) {
          const mainDrawingUpload = await buildingLevel.mainDrawingUpload
          const pdfPath = `/${ATTACHMENT_PATH}/${mainDrawingAttatchment.path}`
          const fileName = mainDrawingUpload.filename.replace('.pdf', '')
          const pngFile = await pdfToImage({ pdfPath, fileName })

          await createAttachmentAfterDelete(context, pngFile, buildingLevel.id, BuildingLevel.name + '_thumbnail')
        }
      }

      // 4. 동별 도면 이미지 저장
      await createAttachmentAfterDelete(context, building?.drawingUpload, building.id, Building.name)
    }

    return projectResult
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete Project' })
  async deleteProject(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Project).delete({ domain: { id: domain.id }, id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }
}

export async function createAttachmentAfterDelete(context: ResolverContext, file: any, refBy: any, refType: any) {
  let result = null

  // undefined = 기존 파일 그대로
  if (file === undefined) return result

  // 기존 첨부 파일이 있으면 삭제
  await deleteAttachmentsByRef(null, { refBys: [refBy], refType }, context)

  // 파일이 있으면 생성 (null로 들어올 경우 delete까지만)
  if (file) {
    result = await createAttachment(null, { attachment: { file, refType, refBy } }, context)
  }

  return result
}

async function pdfToImage({ pdfPath, fileName, extension = 'png' }) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-web-security', '--disable-features=IsolateOrigins', '--disable-site-isolation-trials']
  })

  try {
    const port = process.env.PORT ? `:${process.env.PORT}` : ''
    const url = `http://localhost${port}${pdfPath}`

    const page = await browser.newPage()
    const html = await ejs.render(previewCreatorPage(), { data: { url } })

    // 페이지 로딩시 까지 기다리고 스크린샷
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.waitForNetworkIdle()
    await page.$('#page')
    const screenshot = await page.screenshot({
      type: extension,
      omitBackground: true
    })

    const stream = new Readable()
    stream.push(screenshot)
    stream.push(null)

    await browser.close()

    return {
      filename: `${fileName}.${extension}`,
      mimetype: `image/${extension}`,
      encoding: '7bit',
      createReadStream: () => stream
    }
  } catch (e) {
    await browser.close()
    console.log('Error creating thumbnail', e)
    throw new Error('Error creating thumbnail')
  }
}

function previewCreatorPage() {
  return `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <style>
      body {
        width: 100vw;
        height: 100vh;
        margin: 0;
      }
      #page {
        display: flex;
        width: 100%;
        height: 100%;
      }
    </style>

    <title>Document</title>
  </head>

  <body>
    <canvas id="page"></canvas>
    <script src="https://unpkg.com/pdfjs-dist@2.0.489/build/pdf.min.js"></script>
    <script>
      ;(async () => {
        const pdf = await pdfjsLib.getDocument('<%= data.url %>')
        const page = await pdf.getPage(1)
        const viewport = page.getViewport(2)
        const canvas = document.getElementById('page')
        const context = canvas.getContext('2d')

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        page.render(renderContext)
      })()
    </script>
  </body>
</html>
  `
}
