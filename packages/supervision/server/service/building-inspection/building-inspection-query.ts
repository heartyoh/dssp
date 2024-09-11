import { Resolver, Query, FieldResolver, Root, Arg, Ctx } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getRepository } from '@things-factory/shell'
import { BuildingInspection, BuildingInspectionStatus } from './building-inspection'
import { BuildingInspectionSummary } from './building-inspection-type'
import { BuildingLevel } from '@dssp/building-complex'

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

  @Query(returns => BuildingInspectionSummary, { description: '프로젝트의 검측상태 별 카운트' })
  async buildingInspectionSummaryOfProject(
    @Arg('projectId') projectId: string,
    @Ctx() context: ResolverContext
  ): Promise<BuildingInspectionSummary> {
    const { domain } = context.state

    // TODO 수정
    return {
      request: 0,
      pass: 0,
      fail: 0
    }

    // const queryBuilder = getRepository(Project)
    //   .createQueryBuilder('p')
    //   .select(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.REQUEST}' THEN 1 ELSE NULL END) AS request`)
    //   .addSelect(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.PASS}' THEN 1 ELSE NULL END) AS pass`)
    //   .addSelect(`COUNT(CASE WHEN bi.status='${BuildingInspectionStatus.FAIL}' THEN 1 ELSE NULL END) AS fail`)
    //   .innerJoin('p.buildingComplex', 'bc')
    //   .innerJoin('bc.buildings', 'b')
    //   .innerJoin('b.buildingLevels', 'bl')
    //   .innerJoin('bl.buildingInspections', 'bi')
    //   .where('p.domain = :domain', { domain: domain.id })
    //   .andWhere('p.id = :projectId', { projectId })
    //   .groupBy('p.id')

    // const result = (await queryBuilder.getRawOne()) || {}
    // return {
    //   request: result.request || 0,
    //   pass: result.pass || 0,
    //   fail: result.fail || 0
    // }
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
