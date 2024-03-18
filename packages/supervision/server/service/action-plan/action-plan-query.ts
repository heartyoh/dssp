import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ActionPlan } from './action-plan'
import { ActionPlanList } from './action-plan-type'

@Resolver(ActionPlan)
export class ActionPlanQuery {
  @Query(returns => ActionPlan!, { nullable: true, description: 'To fetch a ActionPlan' })
  async actionPlan(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<ActionPlan> {
    const { domain } = context.state

    return await getRepository(ActionPlan).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => ActionPlanList, { description: 'To fetch multiple ActionPlans' })
  async actionPlans(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ActionPlanList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(ActionPlan),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() actionPlan: ActionPlan): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        domain: { id: actionPlan.domainId },
        refType: ActionPlan.name,
        refBy: actionPlan.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => Domain)
  async domain(@Root() actionPlan: ActionPlan): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: actionPlan.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() actionPlan: ActionPlan): Promise<User> {
    return await getRepository(User).findOneBy({ id: actionPlan.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() actionPlan: ActionPlan): Promise<User> {
    return await getRepository(User).findOneBy({ id: actionPlan.creatorId })
  }
}
