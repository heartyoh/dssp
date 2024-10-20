import { ObjectType, Field, Int } from 'type-graphql'

import { PDFDrawing } from './pdf-drawing'

@ObjectType()
export class DrawingList {
  @Field(type => [PDFDrawing])
  items: PDFDrawing[]

  @Field(type => Int)
  total: number
}
