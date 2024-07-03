import { Resolver, FieldResolver, Root } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingLevel } from './building-level'
import { BuildingInspection } from '../building-inspection/building-inspection'
// import { InspectionSummary } from '@dssp/project'
import { InspectionType } from '../building-inspection/building-inspection'
import { FloorInspectionSummary } from './building-level-type'

@Resolver(BuildingLevel)
export class BuildingLevelQuery {
  @FieldResolver(type => Attachment)
  async mainDrawing(@Root() buildingLevel: BuildingLevel): Promise<Attachment | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name,
        refBy: buildingLevel.id
      }
    })

    return attachment
  }

  @FieldResolver(type => String)
  async mainDrawingThumbnail(@Root() buildingLevel: BuildingLevel): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name + '_thumbnail',
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

  @FieldResolver(type => [BuildingInspection])
  async buildingInspections(@Root() buildingLevel: BuildingLevel): Promise<BuildingInspection[]> {
    return await getRepository(BuildingInspection).findBy({ buildingLevel: { id: buildingLevel.id } })
  }

  // 층 별로 검수 개수 써머리
  @FieldResolver(type => FloorInspectionSummary)
  async floorInspectionSummary(@Root() buildingLevel: BuildingLevel): Promise<FloorInspectionSummary> {
    const floorInspectionSummary = await getRepository(BuildingInspection)
      .createQueryBuilder('bi')
      .select(`COUNT(CASE WHEN bi.type="${InspectionType.REQUEST}" THEN 1 ELSE NULL END) AS request`)
      .addSelect(`COUNT(CASE WHEN bi.type="${InspectionType.PASS}" THEN 1 ELSE NULL END) AS pass`)
      .addSelect(`COUNT(CASE WHEN bi.type="${InspectionType.FAIL}" THEN 1 ELSE NULL END) AS fail`)
      .where('bi.building_level_id = :buildingLevelId', { buildingLevelId: buildingLevel.id })
      .groupBy('bi.building_level_id')
      .getRawOne()

    return {
      request: floorInspectionSummary?.request || 0,
      pass: floorInspectionSummary?.pass || 0,
      fail: floorInspectionSummary?.fail || 0
    }
  }

  @FieldResolver(type => User)
  async creator(@Root() buildingLevel: BuildingLevel): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingLevel.creatorId })
  }
}
