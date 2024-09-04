import { Resolver, Query, FieldResolver, Root, Arg, Ctx } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getRepository } from '@things-factory/shell'
import { Inspection, InspectionStatus } from './inspection'
import { InspectionSummary } from './inspection-type'

@Resolver(Inspection)
export class InspectionQuery {
  @Query(returns => Inspection!, { nullable: true, description: 'To fetch a Inspection' })
  async inspection(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Inspection> {
    return await getRepository(Inspection).findOne({
      where: { id }
    })
  }

  // 층 별로 검수 개수 써머리
  @Query(returns => InspectionSummary!, { nullable: true, description: 'To fetch a Inspection Summary' })
  async inspectionSummaryOfBuildingLevel(
    @Arg('buildingLevelId') buildingLevelId: string,
    @Ctx() context: ResolverContext
  ): Promise<InspectionSummary> {
    const inspectionSummary = await getRepository(Inspection)
      .createQueryBuilder('bi')
      .select(`COUNT(CASE WHEN bi.status='${InspectionStatus.REQUEST}' THEN 1 ELSE NULL END) AS request`)
      .addSelect(`COUNT(CASE WHEN bi.status='${InspectionStatus.PASS}' THEN 1 ELSE NULL END) AS pass`)
      .addSelect(`COUNT(CASE WHEN bi.status='${InspectionStatus.FAIL}' THEN 1 ELSE NULL END) AS fail`)
      .where('bi.building_level_id = :buildingLevelId', { buildingLevelId })
      .groupBy('bi.building_level_id')
      .getRawOne()

    return {
      request: inspectionSummary?.request || 0,
      pass: inspectionSummary?.pass || 0,
      fail: inspectionSummary?.fail || 0
    }
  }

  @FieldResolver(type => [Attachment])
  async attatchments(@Root() inspection: Inspection): Promise<Attachment[] | undefined> {
    const attachment: Attachment[] = await getRepository(Attachment).find({
      where: {
        refType: Inspection.name,
        refBy: inspection.id
      }
    })
    return attachment
  }
}
