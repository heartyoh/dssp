import { Resolver, Query, FieldResolver, Root, Arg, Ctx } from 'type-graphql'
import { Domain, getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from './project'
import { InspectionSummary, ProjectList } from './project-type'
import { BuildingComplex, InspectionStatus } from '@dssp/building-complex'
import { Attachment } from '@things-factory/attachment-base'

@Resolver(Project)
export class ProjectQuery {
  @Query(returns => Project!, { nullable: true, description: 'To fetch a Project' })
  async project(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Project> {
    const { domain } = context.state

    return await getRepository(Project).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => ProjectList, { description: '프로젝트 리스트' })
  async projects(@Arg('projectName') projectName: string, @Ctx() context: ResolverContext): Promise<ProjectList> {
    const { domain } = context.state
    // const { page = 1, limit = 0 } = params.pagination || {}

    const queryBuilder = await getRepository(Project)
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.buildingComplex', 'bc')
      .where('p.domain = :domain', { domain: domain.id })
      .orderBy('p.created_at', 'DESC')
    // .offset((page - 1) * limit)
    // .limit(limit)

    if (projectName) {
      projectName = `%${projectName}%`
      queryBuilder.andWhere('p.name LIKE :projectName', { projectName })
    }

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @Query(returns => InspectionSummary, { description: '프로젝트의 검측상태 별 카운트' })
  async inspectionSummary(
    @Arg('projectId') projectId: string,
    @Ctx() context: ResolverContext
  ): Promise<InspectionSummary> {
    const { domain } = context.state

    const queryBuilder = getRepository(Project)
      .createQueryBuilder('p')
      .select(`COUNT(CASE WHEN bi.status="${InspectionStatus.REQUEST}" THEN 1 ELSE NULL END) AS request`)
      .addSelect(`COUNT(CASE WHEN bi.status="${InspectionStatus.PASS}" THEN 1 ELSE NULL END) AS pass`)
      .addSelect(`COUNT(CASE WHEN bi.status="${InspectionStatus.FAIL}" THEN 1 ELSE NULL END) AS fail`)
      .innerJoin('p.buildingComplex', 'bc')
      .innerJoin('bc.buildings', 'b')
      .innerJoin('b.buildingLevels', 'bl')
      .innerJoin('bl.buildingInspections', 'bi')
      .where('p.domain = :domain', { domain: domain.id })
      .andWhere('p.id = :projectId', { projectId })
      .groupBy('p.id')

    const result = (await queryBuilder.getRawOne()) || {}
    return {
      request: result.request || 0,
      pass: result.pass || 0,
      fail: result.fail || 0
    }
  }

  @FieldResolver(type => Attachment)
  async mainPhoto(@Root() project: Project): Promise<string | Attachment> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        domain: { id: project.domainId },
        refBy: project.id
      },
      order: { createdAt: 'ASC' }
    })

    return attachment
  }

  @FieldResolver(type => BuildingComplex)
  async buildingComplex(@Root() project: Project): Promise<BuildingComplex> {
    return await getRepository(BuildingComplex).findOneBy({ id: project.buildingComplexId })
  }

  @FieldResolver(type => Domain)
  async domain(@Root() project: Project): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: project.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() project: Project): Promise<User> {
    return await getRepository(User).findOneBy({ id: project.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() project: Project): Promise<User> {
    return await getRepository(User).findOneBy({ id: project.creatorId })
  }
}
