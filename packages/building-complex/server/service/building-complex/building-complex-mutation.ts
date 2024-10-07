import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { BuildingComplex } from './building-complex'
import { BuildingComplexPatch } from './building-complex-type'

@Resolver(BuildingComplex)
export class BuildingComplexMutation {
  @Directive('@transaction')
  @Mutation(returns => BuildingComplex, { description: 'To modify BuildingComplex information' })
  async updateBuildingComplex(
    @Arg('id') id: string,
    @Arg('patch') patch: BuildingComplexPatch,
    @Ctx() context: ResolverContext
  ): Promise<BuildingComplex> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(BuildingComplex)
    const buildingComplex = await repository.findOne({
      where: { domain: { id: domain.id }, id }
    })

    const result = await repository.save({
      ...buildingComplex,
      ...patch,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete BuildingComplex' })
  async deleteBuildingComplex(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(BuildingComplex).delete({ domain: { id: domain.id }, id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple BuildingComplexes' })
  async deleteBuildingComplexes(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(BuildingComplex).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }
}
