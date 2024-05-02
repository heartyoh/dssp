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
  @Mutation(returns => [BuildingComplex], { description: "To modify multiple BuildingComplexes' information" })
  async updateMultipleBuildingComplex(
    @Arg('patches', type => [BuildingComplexPatch]) patches: BuildingComplexPatch[],
    @Ctx() context: ResolverContext
  ): Promise<BuildingComplex[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const buildingComplexRepo = tx.getRepository(BuildingComplex)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await buildingComplexRepo.save({
          ...newRecord,
          domain,
          creator: user,
          updater: user
        })

        results.push({ ...result, cuFlag: '+' })
      }
    }

    if (_updateRecords.length > 0) {
      for (let i = 0; i < _updateRecords.length; i++) {
        const updateRecord = _updateRecords[i]
        const buildingComplex = await buildingComplexRepo.findOneBy({ id: updateRecord.id })

        const result = await buildingComplexRepo.save({
          ...buildingComplex,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
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
  async deleteBuildingComplexes(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(BuildingComplex).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple BuildingComplexes' })
  async importBuildingComplexes(
    @Arg('buildingComplexes', type => [BuildingComplexPatch]) buildingComplexes: BuildingComplexPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      buildingComplexes.map(async (buildingComplex: BuildingComplexPatch) => {
        const createdBuildingComplex: BuildingComplex = await tx
          .getRepository(BuildingComplex)
          .save({ domain, ...buildingComplex })
      })
    )

    return true
  }
}
