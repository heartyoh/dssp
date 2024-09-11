import { Resolver, FieldResolver, Root } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingLevel } from './building-level'

@Resolver(BuildingLevel)
export class BuildingLevelQuery {
  @FieldResolver(type => Attachment)
  async mainDrawing(@Root() buildingLevel: BuildingLevel): Promise<Attachment | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name + '_mainDrawing',
        refBy: buildingLevel.id
      }
    })

    return attachment
  }

  @FieldResolver(type => String)
  async mainDrawingImage(@Root() buildingLevel: BuildingLevel): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name + '_mainDrawing_image',
        refBy: buildingLevel.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => String)
  async mainDrawingThumbnail(@Root() buildingLevel: BuildingLevel): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name + '_mainDrawing_thumbnail',
        refBy: buildingLevel.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => Attachment)
  async elevationDrawing(@Root() buildingLevel: BuildingLevel): Promise<Attachment | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name + '_elevationDrawing',
        refBy: buildingLevel.id
      }
    })

    return attachment
  }

  @FieldResolver(type => String)
  async elevationDrawingThumbnail(@Root() buildingLevel: BuildingLevel): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name + '_elevationDrawing_thumbnail',
        refBy: buildingLevel.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => Attachment)
  async rebarDistributionDrawing(@Root() buildingLevel: BuildingLevel): Promise<Attachment | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name + '_rebarDistributionDrawing',
        refBy: buildingLevel.id
      }
    })

    return attachment
  }

  @FieldResolver(type => String)
  async rebarDistributionDrawingThumbnail(@Root() buildingLevel: BuildingLevel): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name + '_rebarDistributionDrawing_thumbnail',
        refBy: buildingLevel.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => User)
  async creator(@Root() buildingLevel: BuildingLevel): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingLevel.creatorId })
  }
}
