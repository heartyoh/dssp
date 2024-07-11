import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx } from 'type-graphql'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { WorkerType } from './worker-type'
import { WorkerTypeList } from './worker-type-type'

@Resolver(WorkerType)
export class WorkerTypeQuery {
  @Query(returns => WorkerType!, { nullable: true, description: 'To fetch a WorkerType' })
  async workerType(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<WorkerType> {
    const { domain } = context.state

    return await getRepository(WorkerType).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => WorkerTypeList, { description: 'To fetch multiple WorkerTypes' })
  async workerTypes(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<WorkerTypeList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(WorkerType)
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => Domain)
  async domain(@Root() workerType: WorkerType): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: workerType.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() workerType: WorkerType): Promise<User> {
    return await getRepository(User).findOneBy({ id: workerType.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() workerType: WorkerType): Promise<User> {
    return await getRepository(User).findOneBy({ id: workerType.creatorId })
  }
}
