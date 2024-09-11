import { Resolver, Query, FieldResolver, Root, Arg, Args, Ctx } from 'type-graphql'
import { IsNull } from 'typeorm'
import { Domain, getRepository, ListParam, getQueryBuilderFromListParams } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from './project'
import { Task } from '../task/task'
import { ProjectList } from './project-type'
import { Attachment } from '@things-factory/attachment-base'
import { BuildingComplex } from '@dssp/building-complex'

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
  async projects(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ProjectList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(Project),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => [Task], { nullable: true })
  async rootTasks(@Root() project: Project): Promise<Task[]> {
    return await getRepository(Task).find({
      where: {
        project: { id: project.id },
        parent: IsNull()
      }
    })
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
