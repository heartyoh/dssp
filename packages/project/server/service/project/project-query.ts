import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from './project'

@Resolver(Project)
export class ProjectQuery {
  @Query(returns => Project!, { nullable: true, description: 'To fetch a Project' })
  async project(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Project> {
    const { domain } = context.state

    return await getRepository(Project).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  // @Query(returns => ProjectList, { description: 'To fetch multiple Projects' })
  // async projects(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ProjectList> {
  //   const { domain } = context.state

  //   const queryBuilder = getQueryBuilderFromListParams({
  //     domain,
  //     params,
  //     repository: await getRepository(Project),
  //     searchables: ['name', 'description']
  //   })

  //   const [items, total] = await queryBuilder.getManyAndCount()

  //   return { items, total }
  // }

  @FieldResolver(type => String)
  async thumbnail(@Root() project: Project): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        domain: { id: project.domainId },
        refType: Project.name,
        refBy: project.id
      }
    })

    return attachment?.fullpath
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
