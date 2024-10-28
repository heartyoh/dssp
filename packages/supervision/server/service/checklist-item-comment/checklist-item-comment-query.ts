import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam, Pagination } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ChecklistItemComment } from './checklist-item-comment'
import { ChecklistItemCommentList } from './checklist-item-comment-type'
import { ChecklistItem } from '../checklist-item/checklist-item'

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
      .skip(offset) // offset을 통해 페이지네이션
      .take(limit) // limit을 통해 한 번에 가져올 데이터 수 제한
      .orderBy('cic.createdAt', 'DESC') // 최신 순으로 정렬
      .getMany()

    return items
  }

  @FieldResolver(type => User)
  async creator(@Root() checklistItemComment: ChecklistItemComment): Promise<User> {
    return checklistItemComment.creatorId && (await getRepository(User).findOneBy({ id: checklistItemComment.creatorId }))
  }
}
