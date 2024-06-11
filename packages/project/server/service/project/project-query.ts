import { Resolver, Query, FieldResolver, Root, Arg, Ctx } from 'type-graphql'
import { Domain, getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from './project'
import { ProjectList } from './project-type'
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
