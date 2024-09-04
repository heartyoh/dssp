import { Resolver, FieldResolver, Root } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingLevel } from './building-level'
// import { InspectionSummary } from '@dssp/project'
import { BuildingInspection, BuildingInspectionStatus } from '../building-inspection/building-inspection'
import { BuildingInspectionSummary } from '../building-inspection/building-inspection-type'

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

  @FieldResolver(type => [BuildingInspection])
  async buildingInspections(@Root() buildingLevel: BuildingLevel): Promise<BuildingInspection[]> {
    return await getRepository(BuildingInspection).findBy({ buildingLevel: { id: buildingLevel.id } })
  }

  // 층 별로 검수 개수 써머리
  @FieldResolver(type => BuildingInspectionSummary)
  async buildingInspectionSummary(@Root() buildingLevel: BuildingLevel): Promise<BuildingInspectionSummary> {
    const buildingInspectionSummary = await getRepository(BuildingInspection)
      .createQueryBuilder('bi')
      .select(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.REQUEST}' THEN 1 ELSE NULL END) AS request`)
      .addSelect(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.PASS}' THEN 1 ELSE NULL END) AS pass`)
      .addSelect(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.FAIL}' THEN 1 ELSE NULL END) AS fail`)
      .where('bi.building_level_id = :buildingLevelId', { buildingLevelId: buildingLevel.id })
      .groupBy('bi.building_level_id')
      .getRawOne()

    return {
      request: buildingInspectionSummary?.request || 0,
      pass: buildingInspectionSummary?.pass || 0,
      fail: buildingInspectionSummary?.fail || 0
    }
  }

  @FieldResolver(type => User)
  async creator(@Root() buildingLevel: BuildingLevel): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingLevel.creatorId })
  }
}
