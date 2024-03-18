import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { Issue } from './issue'
import { NewIssue, IssuePatch } from './issue-type'

@Resolver(Issue)
export class IssueMutation {
  @Directive('@transaction')
  @Mutation(returns => Issue, { description: 'To create new Issue' })
  async createIssue(@Arg('issue') issue: NewIssue, @Ctx() context: ResolverContext): Promise<Issue> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(Issue).save({
      ...issue,
      domain,
      creator: user,
      updater: user
    })

    if (issue.thumbnail) {
      await createAttachment(
        null,
        {
          attachment: {
            file: issue.thumbnail,
            refType: Issue.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Issue, { description: 'To modify Issue information' })
  async updateIssue(
    @Arg('id') id: string,
    @Arg('patch') patch: IssuePatch,
    @Ctx() context: ResolverContext
  ): Promise<Issue> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(Issue)
    const issue = await repository.findOne({
      where: { domain: { id: domain.id }, id }
    })

    const result = await repository.save({
      ...issue,
      ...patch,
      updater: user
    })

    if (patch.thumbnail) {
      await deleteAttachmentsByRef(null, { refBys: [result.id] }, context)
      await createAttachment(
        null,
        {
          attachment: {
            file: patch.thumbnail,
            refType: Issue.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [Issue], { description: "To modify multiple Issues' information" })
  async updateMultipleIssue(
    @Arg('patches', type => [IssuePatch]) patches: IssuePatch[],
    @Ctx() context: ResolverContext
  ): Promise<Issue[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const issueRepo = tx.getRepository(Issue)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await issueRepo.save({
          ...newRecord,
          domain,
          creator: user,
          updater: user
        })

        if (newRecord.thumbnail) {
          await createAttachment(
            null,
            {
              attachment: {
                file: newRecord.thumbnail,
                refType: Issue.name,
                refBy: result.id
              }
            },
            context
          )
        }

        results.push({ ...result, cuFlag: '+' })
      }
    }

    if (_updateRecords.length > 0) {
      for (let i = 0; i < _updateRecords.length; i++) {
        const updateRecord = _updateRecords[i]
        const issue = await issueRepo.findOneBy({ id: updateRecord.id })

        const result = await issueRepo.save({
          ...issue,
          ...updateRecord,
          updater: user
        })

        if (updateRecord.thumbnail) {
          await deleteAttachmentsByRef(null, { refBys: [result.id] }, context)
          await createAttachment(
            null,
            {
              attachment: {
                file: updateRecord.thumbnail,
                refType: Issue.name,
                refBy: result.id
              }
            },
            context
          )
        }

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete Issue' })
  async deleteIssue(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Issue).delete({ domain: { id: domain.id }, id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple Issues' })
  async deleteIssues(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Issue).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple Issues' })
  async importIssues(
    @Arg('issues', type => [IssuePatch]) issues: IssuePatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      issues.map(async (issue: IssuePatch) => {
        const createdIssue: Issue = await tx.getRepository(Issue).save({ domain, ...issue })
      })
    )

    return true
  }
}
