import { Resolver, Query, FieldResolver, Root, Arg, Ctx } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getRepository } from '@things-factory/shell'
import { BuildingInspection, BuildingInspectionStatus } from './building-inspection'
import { BuildingInspectionSummary } from './building-inspection-type'

@Resolver(BuildingInspection)
export class BuildingInspectionQuery {
  @Query(returns => BuildingInspection!, { nullable: true, description: 'To fetch a BuildingInspection' })
  async buildingInspection(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<BuildingInspection> {
    return await getRepository(BuildingInspection).findOne({
      where: { id }
    })
  }

  // 층 별로 검수 개수 써머리
  @Query(returns => BuildingInspectionSummary!, { nullable: true, description: 'To fetch a BuildingInspection Summary' })
  async buildingInspectionSummaryOfBuildingLevel(
    @Arg('buildingLevelId') buildingLevelId: string,
    @Ctx() context: ResolverContext
  ): Promise<BuildingInspectionSummary> {
    const buildingInspectionSummary = await getRepository(BuildingInspection)
      .createQueryBuilder('bi')
      .select(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.REQUEST}' THEN 1 ELSE NULL END) AS request`)
      .addSelect(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.PASS}' THEN 1 ELSE NULL END) AS pass`)
      .addSelect(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.FAIL}' THEN 1 ELSE NULL END) AS fail`)
      .where('bi.building_level_id = :buildingLevelId', { buildingLevelId })
      .groupBy('bi.building_level_id')
      .getRawOne()

    return {
      request: buildingInspectionSummary?.request || 0,
      pass: buildingInspectionSummary?.pass || 0,
      fail: buildingInspectionSummary?.fail || 0
    }
  }

  @FieldResolver(type => [Attachment])
  async attatchments(@Root() buildingInspection: BuildingInspection): Promise<Attachment[] | undefined> {
    const attachment: Attachment[] = await getRepository(Attachment).find({
      where: {
        refType: BuildingInspection.name,
        refBy: buildingInspection.id
      }
    })
    return attachment
  }
}
