import axios from 'axios'
import {
  PDFDrawing,
  PDFDrawingLink,
  PDFDrawingLinkData,
  InsulationSection,
  RoomFinish,
  RoomFinishDetail,
  InternalWallPart,
  WindowPart
} from '../service/pdf-drawing/pdf-drawing'

const API_BASE_URL = 'https://pdfn.ndfolder.com'

class PDFDrawingService {
  async getDrawings(): Promise<PDFDrawing[]> {
    const response = await axios.get(`${API_BASE_URL}/api/dwglinks`)
    return response.data
  }

  async getDrawing(dwgId: string): Promise<PDFDrawing> {
    const drawingPairs = await this.getDrawings()
    const pair = drawingPairs.find(pair => pair.dwgId == dwgId)

    /* drawing의 기본정보도 같이 제공해주길.. */
    const response = await axios.get(`${API_BASE_URL}/api/dwglinks/${dwgId}`)
    return {
      ...response.data,
      ...pair
    }
  }

  async getDrawingByName(filename: string): Promise<PDFDrawing> {
    const drawingPairs = await this.getDrawings()
    const pair = drawingPairs.find(pair => pair.title == filename)

    if (!pair) {
      throw new Error('Drawing Not Found.')
    }
    /* drawing의 기본정보도 같이 제공해주길.. */
    const response = await axios.get(`${API_BASE_URL}/api/dwglinks/${pair.dwgId}`)
    return {
      ...response.data,
      ...pair
    }
  }

  async getDrawingLinks(dwgId: string): Promise<PDFDrawingLink[]> {
    const response = await axios.get(`${API_BASE_URL}/api/dwglinks/${dwgId}`)
    return response.data.links
  }

  // Fetch insulation section
  async getDatas(type: string, symbol: string, rmname?: string, sn?: string): Promise<PDFDrawingLinkData> {
    const response = await axios.get(`${API_BASE_URL}/api/datas`, {
      params: { type, symbol, rmname, sn }
    })
    return response.data
  }

  // Fetch insulation section
  async getInsulationSection(type: string, symbol: string): Promise<InsulationSection> {
    const response = await axios.get(`${API_BASE_URL}/api/datas`, {
      params: { type, symbol }
    })
    return response.data
  }

  // Fetch room finish data
  async getRoomFinish(symbol: string, rmname: string): Promise<RoomFinish> {
    const response = await axios.get(`${API_BASE_URL}/api/datas`, {
      params: { type: 'roomfin', symbol, rmname }
    })
    return response.data
  }

  // Fetch internal wall data
  async getInternalWallPart(symbol: string, rmname: string): Promise<InternalWallPart> {
    const response = await axios.get(`${API_BASE_URL}/api/datas`, {
      params: { type: 'intwall', symbol, rmname }
    })
    return response.data
  }

  // Fetch window details
  async getWindowPart(symbol: string, sn: string): Promise<WindowPart> {
    const response = await axios.get(`${API_BASE_URL}/api/datas`, {
      params: { type: 'win', symbol, sn }
    })
    return response.data
  }
}

export const pdfDrawingService = new PDFDrawingService()
