import { Resolver, Query, Ctx } from 'type-graphql'
import { getRepository } from '@things-factory/shell'
import { Manager } from './manager'
import { ManagerOutput } from './manager-type'
import { User } from '@things-factory/auth-base'

@Resolver(Manager)
export class ManagerQuery {
  @Query(returns => [ManagerOutput], { description: '담당자 리스트' })
  async managers(@Ctx() context: ResolverContext): Promise<ManagerOutput[]> {
    const { domain } = context.state

    const queryBuilder = await getRepository(User)
      .createQueryBuilder('u')
      .select('m.id', 'id')
      .addSelect('m.phone', 'phone')
      .addSelect('m.position', 'position')
      .addSelect('u.id', 'userId')
      .addSelect('u.name', 'name')
      .addSelect('u.updated_at', 'updatedAt')
      .innerJoin('users_domains', 'ud', 'u.id = ud.users_id')
      .leftJoin('managers', 'm', 'u.id = m.user_id')
      .where('ud.domains_id = :domain', { domain: domain.id })
      .orderBy('u.name', 'DESC')

    return await queryBuilder.getRawMany()
  }
}
