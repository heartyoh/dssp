import { Resolver, Query, FieldResolver, Root, Ctx } from 'type-graphql'
import { Domain, getRepository } from '@things-factory/shell'
import { Manager } from './manager'
import { ManagerOutput, ManagerPatch } from './manager-type'
import { User } from '@things-factory/auth-base'

@Resolver(Manager)
export class ManagerQuery {
  @Query(returns => [ManagerOutput], { description: '담당자 리스트' })
  async managers(@Ctx() context: ResolverContext): Promise<ManagerOutput[]> {
    const { domain } = context.state

    const queryBuilder = await getRepository(User)
      .createQueryBuilder('u')
      .select('u.id', 'id')
      .addSelect('u.name', 'name')
      .addSelect('m.phone', 'phone')
      .addSelect('m.position', 'position')
      .innerJoin('users_domains', 'ud', 'u.id = ud.users_id')
      .leftJoin('managers', 'm', 'u.id = m.user_id')
      .where('ud.domains_id = :domain', { domain: domain.id })
      .orderBy('u.name', 'DESC')

    return await queryBuilder.getRawMany()
  }

  @FieldResolver(type => Domain)
  async domain(@Root() manager: Manager): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: manager.domainId })
  }

  // @FieldResolver(type => User)
  // async user(@Root() manager: Manager): Promise<User> {
  //   return await getRepository(User).findOneBy({ id: manager.userId })
  // }
}
