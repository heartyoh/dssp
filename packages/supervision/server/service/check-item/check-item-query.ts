import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { CheckItem } from './check-item'
import { CheckItemList } from './check-item-type'

@Resolver(CheckItem)
export class CheckItemQuery {
  @Query(returns => CheckItem!, { nullable: true, description: 'To fetch a CheckItem' })
  async checkItem(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<CheckItem> {
    const { domain } = context.state

    return await getRepository(CheckItem).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => CheckItemList, { description: 'To fetch multiple CheckItems' })
  async checkItems(@Args() params: ListParam, @Ctx() context: ResolverContext): Promise<CheckItemList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(CheckItem),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => String)
  async thumbnail(@Root() checkItem: CheckItem): Promise<string | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        domain: { id: checkItem.domainId },
        refType: CheckItem.name,
        refBy: checkItem.id
      }
    })

    return attachment?.fullpath
  }

  @FieldResolver(type => Domain)
  async domain(@Root() checkItem: CheckItem): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: checkItem.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() checkItem: CheckItem): Promise<User> {
    return await getRepository(User).findOneBy({ id: checkItem.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() checkItem: CheckItem): Promise<User> {
    return await getRepository(User).findOneBy({ id: checkItem.creatorId })
  }
}
