import { ILike } from 'typeorm'
import { Resolver, Query, Arg, FieldResolver, Ctx, Root } from 'type-graphql'

import { getRepository } from '@things-factory/shell'
import { Attachment } from '@things-factory/attachment-base'

import { PDFDrawing, PDFDrawingLink, InsulationSection, InternalWallPart, RoomFinish, WindowPart } from './pdf-drawing'

import { pdfDrawingService } from '../../controllers/pdf-drawing-service'

@Resolver(PDFDrawing)
export class PDFDrawingQuery {
  @Query(returns => [PDFDrawing], { description: 'To fetch multiple PDFDrawings' })
  async pdfDrawings(): Promise<PDFDrawing[]> {
    return await pdfDrawingService.getDrawings()
  }

  @Query(returns => PDFDrawing, { description: 'To fetch a PDFDrawing' })
  async pdfDrawing(@Arg('dwgId') dwgId: string): Promise<PDFDrawing> {
    const pdfDrawing = await pdfDrawingService.getDrawing(dwgId)
    return pdfDrawing
  }

  @FieldResolver(type => [PDFDrawingLink])
  async links(@Root() pdfDrawing: PDFDrawing): Promise<PDFDrawingLink[]> {
    const { dwgId } = pdfDrawing
    const links = await pdfDrawingService.getDrawingLinks(dwgId)

    return Promise.all(
      links.map(async link => {
        const { type, symbol, rmname, sn } = link
        return {
          ...link,
          ...(await pdfDrawingService.getDatas(type, symbol, rmname, sn))
        }
      })
    )
  }

  @FieldResolver(type => String)
  async drawingURL(@Root() pdfDrawing: PDFDrawing, @Ctx() context: ResolverContext): Promise<string> {
    const { dwgId } = pdfDrawing
    const attachmentRepository = getRepository(Attachment)

    const { domain } = context.state
    const tag = dwgId.replace('-', '_')

    const attachments = await attachmentRepository.find({
      where: {
        domain: { id: domain.id },
        tags: ILike('%' + tag + '%')
      }
    })

    const attachment = attachments.find(attachment => attachment.tags.includes(tag))

    return attachment?.fullpath
  }
}

@Resolver(PDFDrawingLink)
export class PDFDrawingLinkQuery {
  @Query(() => InsulationSection)
  async insulationSection(@Arg('symbol') symbol: string) {
    return await pdfDrawingService.getInsulationSection('insulsect', symbol)
  }

  @Query(() => RoomFinish)
  async roomFinish(@Arg('symbol') symbol: string, @Arg('rmname') rmname: string) {
    return await pdfDrawingService.getRoomFinish(symbol, rmname)
  }

  @Query(() => InternalWallPart)
  async internalWallPart(@Arg('symbol') symbol: string, @Arg('rmname') rmname: string) {
    return await pdfDrawingService.getInternalWallPart(symbol, rmname)
  }

  @Query(() => WindowPart)
  async window(@Arg('symbol') symbol: string, @Arg('sn') sn: string) {
    return await pdfDrawingService.getWindowPart(symbol, sn)
  }
}
