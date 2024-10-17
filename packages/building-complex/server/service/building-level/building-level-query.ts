import { Resolver, Query, FieldResolver, Root, Arg, Ctx } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingLevel } from './building-level'
import { Building } from '../building/building'
import { BuildingInspectionStatus, BuildingInspectionSummaryOfLevel } from './building-level-type'

@Resolver(BuildingLevel)
export class BuildingLevelQuery {
  @Query(returns => BuildingLevel!, { nullable: true, description: 'To fetch a building level' })
  async buildingLevel(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<BuildingLevel> {
    return await getRepository(BuildingLevel).findOne({
      where: { id }
    })
  }

  @FieldResolver(type => Building)
  async building(@Root() buildingLevel: BuildingLevel): Promise<Building> {
    return await getRepository(Building).findOneBy({ id: buildingLevel.buildingId })
  }

  @FieldResolver(type => BuildingInspectionSummaryOfLevel)
  async inspectionSummary(@Root() buildingLevel: BuildingLevel): Promise<BuildingInspectionSummaryOfLevel> {
    const buildingInspectionSummary = await getRepository(BuildingLevel)
      .createQueryBuilder('bl')
      .select(
        `COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.WAIT}' OR bi.status='${BuildingInspectionStatus.OVERALL_WAIT}' THEN 1 ELSE NULL END) AS wait`
      )
      .addSelect(
        `COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.REQUEST}' OR bi.status='${BuildingInspectionStatus.OVERALL_REQUEST}' THEN 1 ELSE NULL END) AS request`
      )
      .addSelect(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.PASS}' THEN 1 ELSE NULL END) AS pass`)
      .addSelect(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.FAIL}' THEN 1 ELSE NULL END) AS fail`)
      .leftJoin('building_inspections', 'bi', 'bi.building_level_id = bl.id')
      .where('bi.building_level_id = :buildingLevelId', { buildingLevelId: buildingLevel.id })
      .groupBy('bi.building_level_id')
      .getRawOne()

    if (!buildingInspectionSummary) {
      return {
        wait: 0,
        request: 0,
        pass: 0,
        fail: 0
      } as BuildingInspectionSummaryOfLevel
    }

    return buildingInspectionSummary
  }

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
