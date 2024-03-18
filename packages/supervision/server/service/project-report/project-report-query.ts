import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ProjectReport } from './project-report'
import { ProjectReportList } from './project-report-type'

@Resolver(ProjectReport)
export class ProjectReportQuery {
  @Query(returns => ProjectReport!, { nullable: true, description: 'To fetch a ProjectReport' })
  async projectReport(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<ProjectReport> {
    const { domain } = context.state

    return await getRepository(ProjectReport).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => ProjectReportList, { description: 'To fetch multiple ProjectReports' })
  async projectReports(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ProjectReportList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(ProjectReport),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() projectReport: ProjectReport): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        domain: { id: projectReport.domainId },
        refType: ProjectReport.name,
        refBy: projectReport.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => Domain)
  async domain(@Root() projectReport: ProjectReport): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: projectReport.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() projectReport: ProjectReport): Promise<User> {
    return await getRepository(User).findOneBy({ id: projectReport.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() projectReport: ProjectReport): Promise<User> {
    return await getRepository(User).findOneBy({ id: projectReport.creatorId })
  }
}
