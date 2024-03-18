import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Supervisor } from './supervisor'
import { SupervisorList } from './supervisor-type'

@Resolver(Supervisor)
export class SupervisorQuery {
  @Query(returns => Supervisor!, { nullable: true, description: 'To fetch a Supervisor' })
  async supervisor(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Supervisor> {
    const { domain } = context.state

    return await getRepository(Supervisor).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => SupervisorList, { description: 'To fetch multiple Supervisors' })
  async supervisors(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<SupervisorList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(Supervisor),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() supervisor: Supervisor): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        domain: { id: supervisor.domainId },
        refType: Supervisor.name,
        refBy: supervisor.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => Domain)
  async domain(@Root() supervisor: Supervisor): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: supervisor.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() supervisor: Supervisor): Promise<User> {
    return await getRepository(User).findOneBy({ id: supervisor.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() supervisor: Supervisor): Promise<User> {
    return await getRepository(User).findOneBy({ id: supervisor.creatorId })
  }
}
