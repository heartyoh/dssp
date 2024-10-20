import gql from 'graphql-tag'
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy } from 'pdfjs-dist'

import { client } from '@operato/graphql'
import { ImageProvider, ImageOptions, Shape } from '@operato/image-marker'

GlobalWorkerOptions.workerSrc = '/assets/javascript/pdf.worker.min.mjs'

export type PDFDrawing = {
  id: string
  dwgId: string
  drawingURL?: string
  title?: string
  links?: PDFDrawingLink[]
}

export type PDFDrawingLink = {
  id?: string
  type?: string
  symbol?: string
  story?: string
  box?: string
  rmname?: string
  sn?: string
  code?: string
  finDetItems?: RoomFinishDetail[]
}

export type RoomFinishDetail = {
  part?: string
  symbol?: string
  dwgId?: string
  box?: string
}

export class DrawingImageProvider implements ImageProvider {
  // 문서 ID별로 다양한 배수의 이미지를 캐시
  private cache: Map<string, Map<number, { data: string; expiry: number }>> = new Map()
  private cacheTTL = 1000 * 60 * 5 // 5분 후 캐시 만료

  // Query 결과를 위한 캐시
  private queryCache: Map<string, { data: PDFDrawing; expiry: number }> = new Map()

  // GraphQL 요청을 분리하여 재사용 가능하게 함
  async getPdfDrawingData(dwgId: string): Promise<PDFDrawing | undefined> {
    if (!dwgId) {
      return
    }

    const currentTime = Date.now()

    // 캐시에서 해당 dwgId의 쿼리 결과 확인
    if (this.queryCache.has(dwgId)) {
      const cachedQuery = this.queryCache.get(dwgId)!
      if (currentTime < cachedQuery.expiry) {
        return cachedQuery.data // 캐시된 데이터 반환
      } else {
        this.queryCache.delete(dwgId) // 만료된 쿼리 삭제
      }
    }

    // GraphQL 쿼리 실행
    const response = await client.query({
      query: gql`
        query ($dwgId: String!) {
          pdfDrawing(dwgId: $dwgId) {
            id
            dwgId
            drawingURL
            title
            links {
              id
              type
              symbol
              story
              box
              rmname
              code
              sn
              finDetItems {
                part
                symbol
                dwgId
                box
              }
            }
          }
        }
      `,
      variables: { dwgId }
    })

    const pdfDrawing = response.data?.pdfDrawing

    // 쿼리 결과를 캐시에 저장
    this.queryCache.set(dwgId, {
      data: pdfDrawing,
      expiry: currentTime + this.cacheTTL // 5분 후 캐시 만료
    })

    return pdfDrawing
  }

  // 이미지를 가져오는 함수
  async getImage(options: ImageOptions): Promise<string> {
    // 쿼리 데이터 가져오기
    const pdfDrawing = await this.getPdfDrawingData(options.id)
    if (!pdfDrawing) {
      return ''
    }

    const { dwgId, drawingURL } = pdfDrawing

    const allowedScales = [2, 4, 8]
    let closestScale = allowedScales.reduce((prev, curr) =>
      Math.abs(curr - options.scale) < Math.abs(prev - options.scale) ? curr : prev
    )

    // 1배 이하로 축소된 경우 1배 이미지를 사용
    if (options.scale <= 1) {
      closestScale = 1
    }

    const currentTime = Date.now()

    // 캐시에서 문서별 캐시 확인
    if (!this.cache.has(dwgId)) {
      this.cache.set(dwgId, new Map()) // 해당 문서에 대한 캐시가 없으면 새로 생성
    }
    const documentCache = this.cache.get(dwgId)!

    // 이미 해당 배수로 캐시가 존재하면 반환
    if (documentCache.has(closestScale)) {
      const cachedData = documentCache.get(closestScale)!
      if (currentTime < cachedData.expiry) {
        return cachedData.data // 캐시된 데이터 반환
      } else {
        documentCache.delete(closestScale) // 만료된 항목 삭제
      }
    }

    // 새로운 이미지 생성
    const loadingTask = getDocument(drawingURL)
    const pdf: PDFDocumentProxy = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: (closestScale * 100) / 72 })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height

    if (context) {
      await page.render({ canvasContext: context, viewport }).promise
    }

    const imageDataURL = canvas.toDataURL()

    // 새로운 이미지를 캐시에 저장, 5분 후 만료
    documentCache.set(closestScale, { data: imageDataURL, expiry: currentTime + this.cacheTTL })

    return imageDataURL
  }

  async getMarkers(id: string): Promise<Shape[]> {
    const pdfDrawing = await this.getPdfDrawingData(id)
    if (!pdfDrawing) {
      return []
    }
    const links = pdfDrawing.links

    return (links || []).map(link => {
      const { id, box, type, symbol, story } = link
      const [x, y, width, height] = box?.split(',').map(Number) || []
      return {
        id: id!,
        type: 'rectangle',
        x,
        y,
        width,
        height,
        link: JSON.stringify({ type, symbol, story })
      }
    })
  }
}
