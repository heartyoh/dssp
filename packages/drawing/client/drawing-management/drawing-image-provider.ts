import gql from 'graphql-tag'
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy } from 'pdfjs-dist'

import { client } from '@operato/graphql'
import { ImageProvider, ImageOptions, Shape } from '@operato/image-marker'

GlobalWorkerOptions.workerSrc = '/assets/javascript/pdf.worker.min.mjs'

type RoomFinishDetail = {
  part: string
  symbol: string
  dwgId: string
  box: string
}

type PDFDrawingLinkData = {
  id: string
  dwgId: string
  type: string
  symbol: string
  box: string
  rmname: string
  sn: string
  code: string
  finDetItems: RoomFinishDetail[]
}

type PDFDrawingLink = {
  id: string
  type: string
  symbol: string
  story: string
  box: string
  data?: PDFDrawingLinkData
}

type PDFDrawing = {
  id: string
  dwgId: string
  drawingURL?: string
  title?: string
  links?: PDFDrawingLink[]
}

export class DrawingImageProvider implements ImageProvider {
  private cache: Map<string, Map<number, { data: string; expiry: number }>> = new Map()
  private cacheTTL = 1000 * 60 * 5 // 5분 후 캐시 만료

  private queryCache: Map<string, { data: PDFDrawing; expiry: number }> = new Map()

  async getPdfDrawingData(title: string): Promise<PDFDrawing | undefined> {
    if (!title) {
      return
    }

    const currentTime = Date.now()

    if (this.queryCache.has(title)) {
      const cachedQuery = this.queryCache.get(title)!
      if (currentTime < cachedQuery.expiry) {
        return cachedQuery.data // 캐시된 데이터 반환
      } else {
        this.queryCache.delete(title) // 만료된 쿼리 삭제
      }
    }

    var pdfDrawing

    if (title.startsWith('DWGID:')) {
      const response = await client.query({
        query: gql`
          query ($dwgId: String!) {
            pdfDrawingByDwgId(dwgId: $dwgId) {
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
                data {
                  id
                  type
                  symbol
                  dwgId
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
          }
        `,
        variables: { dwgId: title.substring(6) }
      })

      pdfDrawing = response.data?.pdfDrawingByDwgId
    } else {
      const response = await client.query({
        query: gql`
          query ($title: String!) {
            pdfDrawingByTitle(title: $title) {
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
                data {
                  id
                  type
                  symbol
                  dwgId
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
          }
        `,
        variables: { title }
      })

      pdfDrawing = response.data?.pdfDrawingByTitle
    }

    // 쿼리 결과를 캐시에 저장
    this.queryCache.set(title, {
      data: pdfDrawing,
      expiry: currentTime + this.cacheTTL // 5분 후 캐시 만료
    })

    return pdfDrawing
  }

  // 이미지를 가져오는 함수
  async getImage(options: ImageOptions): Promise<string> {
    // 쿼리 데이터 가져오기
    const pdfDrawing = await this.getPdfDrawingData(options.id)
    if (!pdfDrawing?.drawingURL) {
      return ''
    }

    const { title, drawingURL } = pdfDrawing

    const allowedScales = [2, 4]
    let closestScale = allowedScales.reduce((prev, curr) =>
      Math.abs(curr - options.scale) < Math.abs(prev - options.scale) ? curr : prev
    )

    // 1배 이하로 축소된 경우 1배 이미지를 사용
    if (options.scale <= 1) {
      closestScale = 1
    }

    const currentTime = Date.now()

    // 캐시에서 문서별 캐시 확인
    if (!this.cache.has(title!)) {
      this.cache.set(title!, new Map()) // 해당 문서에 대한 캐시가 없으면 새로 생성
    }
    const documentCache = this.cache.get(title!)!

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
      const { id, box, data } = link
      const [x, y, width, height] = box?.split(',').map(Number) || []
      return {
        id: id!,
        type: 'link',
        x,
        y,
        width,
        height,
        link: JSON.stringify(data)
      }
    })
  }
}
