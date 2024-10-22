import { Resolver, Query, Arg, FieldResolver, Ctx, Root } from 'type-graphql'

import { getRepository } from '@things-factory/shell'
import { Attachment } from '@things-factory/attachment-base'

import { PDFDrawing, PDFDrawingLink } from './pdf-drawing'

import { pdfDrawingService } from '../../controllers/pdf-drawing-service'

@Resolver(PDFDrawing)
export class PDFDrawingQuery {
  @Query(returns => [PDFDrawing], { description: 'To fetch multiple PDFDrawings' })
  async pdfDrawings(): Promise<PDFDrawing[]> {
    return await pdfDrawingService.getDrawings()
  }

  @Query(returns => PDFDrawing, { description: 'To fetch a PDFDrawing' })
  async pdfDrawing(@Arg('dwgId') dwgId: string): Promise<PDFDrawing> {
    try {
      return await pdfDrawingService.getDrawing(dwgId)
    } catch (error) {
      return {
        id: 'NOT FOUND',
        dwgId
      }
    }
  }

  @Query(returns => PDFDrawing, { description: 'To fetch a PDFDrawing by title' })
  async pdfDrawingByTitle(@Arg('title') title: string): Promise<PDFDrawing> {
    try {
      return await pdfDrawingService.getDrawingByName(title)
    } catch (error) {
      return {
        id: 'NOT FOUND'
      }
    }
  }

  @FieldResolver(type => [PDFDrawingLink])
  async links(@Root() pdfDrawing: PDFDrawing): Promise<PDFDrawingLink[]> {
    const { dwgId } = pdfDrawing
    try {
      const links = await pdfDrawingService.getDrawingLinks(dwgId)

      return Promise.all(
        links.map(async link => {
          const { type, symbol } = link
          return {
            ...link,
            data: await pdfDrawingService.getDatas(type, symbol)
          }
        })
      )
    } catch (error) {
      return []
    }
  }

  @FieldResolver(type => String)
  async drawingURL(@Root() pdfDrawing: PDFDrawing, @Ctx() context: ResolverContext): Promise<string> {
    const { title } = pdfDrawing

    const attachmentRepository = getRepository(Attachment)

    const { domain } = context.state

    // const tag = dwgId.replace('-', '_')

    // const attachments = await attachmentRepository.find({
    //   where: {
    //     domain: { id: domain.id },
    //     tags: ILike('%' + tag + '%')
    //   }
    // })
    //
    // const attachment = attachments.find(attachment => attachment.tags.includes(tag))

    const attachment = await attachmentRepository.findOne({
      where: {
        domain: { id: domain.id },
        name: title + '.pdf'
      }
    })

    return attachment?.fullpath
  }
}