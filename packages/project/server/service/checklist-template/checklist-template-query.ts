import { Resolver, Query, FieldResolver, Root, Args, Ctx } from 'type-graphql'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistTemplate } from './checklist-template'
import { ChecklistTemplateList } from './checklist-template-type'

@Resolver(ChecklistTemplate)
export class ChecklistTemplateQuery {
  @Query(returns => ChecklistTemplateList, { description: 'To fetch multiple ChecklistTemplates' })
  async checklistTemplates(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<ChecklistTemplateList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(ChecklistTemplate),
      searchables: ['name']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => Domain)
  async domain(@Root() checklistTemplate: ChecklistTemplate): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: checklistTemplate.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() checklistTemplate: ChecklistTemplate): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistTemplate.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() checklistTemplate: ChecklistTemplate): Promise<User> {
    return await getRepository(User).findOneBy({ id: checklistTemplate.creatorId })
  }
}
