import { Resolver, Query, FieldResolver, Root, Arg, Ctx } from 'type-graphql'
import { getRepository, Pagination } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistItemComment } from './checklist-item-comment'

@Resolver(ChecklistItemComment)
export class ChecklistItemCommentQuery {
  @Query(returns => [ChecklistItemComment], { description: 'To fetch multiple ChecklistItemComments' })
  async checklistItemComments(
    @Arg('checklistItemId') checklistItemId: string,
    @Arg('pagination') pagination: Pagination,
    @Ctx() context: ResolverContext
  ): Promise<ChecklistItemComment[]> {
    const { limit, page } = pagination

    // 페이지네이션을 위한 offset 계산
    const offset = (page - 1) * limit

    // 코멘트와 총 개수를 가져오는 쿼리
    const items = await getRepository(ChecklistItemComment)
      .createQueryBuilder('cic')
      .innerJoin('cic.checklistItem', 'ci')
      .where('cic.checklistItem = :checklistItemId', { checklistItemId })
      .skip(offset)
      .take(limit)
      .orderBy('cic.createdAt', 'DESC')
      .getMany()

    return items
  }

  @FieldResolver(type => User)
  async creator(@Root() checklistItemComment: ChecklistItemComment): Promise<User> {
    return checklistItemComment.creatorId && (await getRepository(User).findOneBy({ id: checklistItemComment.creatorId }))
  }
}
