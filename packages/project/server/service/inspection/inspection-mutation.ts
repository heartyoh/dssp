import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { Inspection } from './inspection'
import { InspectionPatch } from './inspection-type'

@Resolver(Inspection)
export class InspectionMutation {
  @Directive('@transaction')
  @Mutation(returns => Inspection, { description: 'To create Inspection information' })
  async createInspection(@Arg('patch') patch: InspectionPatch, @Ctx() context: ResolverContext): Promise<Inspection> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(Inspection)

    const result = await repository.save({
      ...patch,
      domain,
      creator: user,
      updater: user
    })

    return result
  }
}
