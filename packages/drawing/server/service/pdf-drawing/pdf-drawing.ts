import { ObjectType, Field } from 'type-graphql'

// Type for insulation section
@ObjectType()
export class InsulationSection {
  @Field({ nullable: true }) id: string
  @Field({ nullable: true }) dwgId: string
  @Field({ nullable: true }) type: string
  @Field({ nullable: true }) symbol: string
  @Field({ nullable: true }) box: string
}

// Details for room finish
@ObjectType()
export class RoomFinishDetail {
  @Field({ nullable: true }) part: string
  @Field({ nullable: true }) symbol: string
  @Field({ nullable: true }) dwgId: string
  @Field({ nullable: true }) box: string
}

// Type for room finish
@ObjectType()
export class RoomFinish {
  @Field({ nullable: true }) code: string
  @Field({ nullable: true }) name: string
  @Field(() => [RoomFinishDetail]) finDetItems: RoomFinishDetail[]
}

// Type for internal wall
@ObjectType()
export class InternalWallPart {
  @Field({ nullable: true }) id: string
  @Field({ nullable: true }) dwgId: string
  @Field({ nullable: true }) type: string
  @Field({ nullable: true }) symbol: string
  @Field({ nullable: true }) box: string
}

// Type for window details
@ObjectType()
export class WindowPart {
  @Field({ nullable: true }) id: string
  @Field({ nullable: true }) dwgId: string
  @Field({ nullable: true }) type: string
  @Field({ nullable: true }) symbol: string
  @Field({ nullable: true }) sn: string
  @Field({ nullable: true }) box: string
}

@ObjectType()
export class PDFDrawingLinkData {
  @Field({ nullable: true }) id: string
  @Field({ nullable: true }) dwgId: string
  @Field({ nullable: true }) type: string
  @Field({ nullable: true }) symbol: string
  @Field({ nullable: true }) box: string
  @Field({ nullable: true }) rmname: string
  @Field({ nullable: true }) sn: string
  @Field({ nullable: true }) code: string
  @Field(type => [RoomFinishDetail], { nullable: true }) finDetItems: RoomFinishDetail[]
}

@ObjectType()
export class PDFDrawingLink {
  @Field({ nullable: true }) id: string
  @Field({ nullable: true }) type: string
  @Field({ nullable: true }) symbol: string
  @Field({ nullable: true }) story: string
  @Field({ nullable: true }) box: string
  @Field(type => PDFDrawingLinkData, { nullable: true }) data?: PDFDrawingLinkData
}

@ObjectType()
export class PDFDrawing {
  @Field({ nullable: true }) id?: string
  @Field({ nullable: true }) dwgId?: string
  @Field({ nullable: true }) drawingURL?: string
  @Field({ nullable: true }) title?: string
  @Field(type => [PDFDrawingLink], { nullable: true }) links?: PDFDrawingLink[]
}
