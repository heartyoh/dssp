import { Resolver, Query, FieldResolver, Root, Arg, Args, Ctx } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getRepository, getQueryBuilderFromListParams, ListParam } from '@things-factory/shell'
import { BuildingInspection, BuildingInspectionStatus } from './building-inspection'
import { BuildingInspectionList, BuildingInspectionsOfProject, BuildingInspectionSummary } from './building-inspection-type'
import { BuildingLevel } from '@dssp/building-complex'
import { Checklist } from '../checklist/checklist'
import { Project } from '@dssp/project'

@Resolver(BuildingInspection)
export class BuildingInspectionQuery {
  @Query(returns => BuildingInspection!, { nullable: true, description: 'To fetch a BuildingInspection' })
  async buildingInspection(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<BuildingInspection> {
    return await getRepository(BuildingInspection).findOne({
      where: { id }
    })
  }

  @Query(returns => BuildingInspectionList, { description: 'To fetch multiple BuildingInspections' })
  async buildingInspections(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<BuildingInspectionList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      params,
      repository: await getRepository(BuildingInspection),
      searchables: ['name']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @Query(returns => BuildingInspectionList, { description: 'To fetch multiple BuildingInspections' })
  async buildingInspectionsOfProject(
    @Arg('params') params: BuildingInspectionsOfProject,
    @Ctx() context: ResolverContext
  ): Promise<BuildingInspectionList> {
    const { domain } = context.state
    const { projectId, limit } = params

    const queryBuilder = getRepository(BuildingInspection)
      .createQueryBuilder('bi')
      .innerJoin('building_levels', 'bl', 'bi.building_level_id = bl.id')
      .innerJoin('buildings', 'b', 'bl.building_id = b.id')
      .innerJoin('building_complexes', 'bc', 'b.building_complex_id = bc.id')
      .innerJoin('projects', 'p', 'bc.id = p.building_complex_id')
      .innerJoin('checklists', 'c', 'bi.checklist_id = c.id')
      .where('p.domain = :domain', { domain: domain.id })
      .andWhere('p.id = :projectId', { projectId })
      .orderBy('bi.created_at', 'DESC')

    if (limit) {
      queryBuilder.limit(limit)
    }

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
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

    const result = await getRepository(Project)
      .createQueryBuilder('p')
      .select(`COUNT(CASE WHEN bi.status = '${BuildingInspectionStatus.REQUEST}' THEN 1 ELSE NULL END) AS request`)
      .addSelect(`COUNT(CASE WHEN bi.status = '${BuildingInspectionStatus.PASS}' THEN 1 ELSE NULL END) AS pass`)
      .addSelect(`COUNT(CASE WHEN bi.status = '${BuildingInspectionStatus.FAIL}' THEN 1 ELSE NULL END) AS fail`)
      .innerJoin('p.buildingComplex', 'bc')
      .innerJoin('bc.buildings', 'b')
      .innerJoin('b.buildingLevels', 'bl')
      .leftJoin('building_inspections', 'bi', 'bi.building_level_id = bl.id AND bi.deleted_at IS NULL')
      .where('p.domain = :domain', { domain: domain.id })
      .andWhere('p.id = :projectId', { projectId })
      .groupBy('p.id')
      .getRawOne()

    return {
      request: result.request || 0,
      pass: result.pass || 0,
      fail: result.fail || 0
    }
  }

  @FieldResolver(type => Checklist)
  async checklist(@Root() buildingInspection: BuildingInspection): Promise<Checklist> {
    return await getRepository(Checklist).findOneBy({ id: buildingInspection.checklistId })
  }

  @FieldResolver(type => BuildingLevel)
  async buildingLevel(@Root() buildingInspection: BuildingInspection): Promise<BuildingLevel> {
    return await getRepository(BuildingLevel).findOneBy({ id: buildingInspection.buildingLevelId })
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
