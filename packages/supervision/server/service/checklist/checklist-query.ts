import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Checklist } from './checklist'
import { ChecklistList } from './checklist-type'

@Resolver(Checklist)
export class ChecklistQuery {
  @Query(returns => Checklist!, { nullable: true, description: 'To fetch a Checklist' })
  async checklist(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Checklist> {
    const { domain } = context.state

    return await getRepository(Checklist).findOne({
      where: { id }
    })
  }

  @Query(returns => ChecklistList, { description: 'To fetch multiple Checklists' })
  async checklists(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ChecklistList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(Checklist),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => User)
  async updater(@Root() checklist: Checklist): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklist.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() checklist: Checklist): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklist.creatorId })
  }
}
