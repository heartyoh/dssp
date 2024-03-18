import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Issue } from './issue'
import { IssueList } from './issue-type'

@Resolver(Issue)
export class IssueQuery {
  @Query(returns => Issue!, { nullable: true, description: 'To fetch a Issue' })
  async issue(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Issue> {
    const { domain } = context.state

    return await getRepository(Issue).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => IssueList, { description: 'To fetch multiple Issues' })
  async issues(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<IssueList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(Issue),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() issue: Issue): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        domain: { id: issue.domainId },
        refType: Issue.name,
        refBy: issue.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => Domain)
  async domain(@Root() issue: Issue): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: issue.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() issue: Issue): Promise<User> {
    return await getRepository(User).findOneBy({ id: issue.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() issue: Issue): Promise<User> {
    return await getRepository(User).findOneBy({ id: issue.creatorId })
  }
}
