import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { getRepository } from '@things-factory/shell'
import { ChecklistItemComment } from './checklist-item-comment'
import { NewChecklistItemComment, ChecklistItemCommentPatch } from './checklist-item-comment-type'

@Resolver(ChecklistItemComment)
export class ChecklistItemCommentMutation {
  @Directive('@transaction')
  @Mutation(returns => ChecklistItemComment, { description: 'To create new ChecklistItemComment' })
  async createChecklistItemComment(
    @Arg('checklistItemComment') checklistItemComment: NewChecklistItemComment,
    @Ctx() context: ResolverContext
  ): Promise<ChecklistItemComment> {
    const { user, tx } = context.state
    const { comment, checklistItemId } = checklistItemComment

    const result = await getRepository(ChecklistItemComment, tx).save({
      comment,
      checklistItem: { id: checklistItemId },
      createdAt: new Date(),
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => ChecklistItemComment, { description: 'To modify ChecklistItemComment information' })
  async updateChecklistItemComment(
    @Arg('id') id: string,
    @Arg('patch') patch: ChecklistItemCommentPatch,
    @Ctx() context: ResolverContext
  ): Promise<ChecklistItemComment> {
    const { user, tx } = context.state

    const repository = getRepository(ChecklistItemComment, tx)
    const checklistItemComment = await repository.findOne({
      where: { id }
    })

    const result = await repository.save({
      ...checklistItemComment,
      ...patch,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete ChecklistItemComment' })
  async deleteChecklistItemComment(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { tx } = context.state

    await getRepository(ChecklistItemComment, tx).softDelete({ id })

    return true
  }
}
