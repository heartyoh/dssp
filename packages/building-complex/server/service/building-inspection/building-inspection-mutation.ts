import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { BuildingInspection } from './building-inspection'
import { BuildingInspectionPatch } from './building-inspection-type'

@Resolver(BuildingInspection)
export class BuildingInspectionMutation {
  @Directive('@transaction')
  @Mutation(returns => BuildingInspection, { description: 'To create BuildingInspection information' })
  async createBuildingInspection(
    @Arg('patch') patch: BuildingInspectionPatch,
    @Ctx() context: ResolverContext
  ): Promise<BuildingInspection> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(BuildingInspection)

    const result = await repository.save({
      ...patch,
      domain,
      creator: user,
      updater: user
    })

    return result
  }
}
