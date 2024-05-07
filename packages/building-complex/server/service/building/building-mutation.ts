import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { Building } from './building'
import { BuildingPatch } from './building-type'

@Resolver(Building)
export class BuildingMutation {
  @Directive('@transaction')
  @Mutation(returns => Building, { description: 'To modify Building information' })
  async updateBuilding(
    @Arg('id') id: string,
    @Arg('patch') patch: BuildingPatch,
    @Ctx() context: ResolverContext
  ): Promise<Building> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(Building)
    const building = await repository.findOne({
      where: { id }
    })

    const result = await repository.save({
      ...building,
      ...patch,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [Building], { description: "To modify multiple Buildings' information" })
  async updateMultipleBuilding(
    @Arg('patches', type => [BuildingPatch]) patches: BuildingPatch[],
    @Ctx() context: ResolverContext
  ): Promise<Building[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const buildingRepo = tx.getRepository(Building)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await buildingRepo.save({
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
        const building = await buildingRepo.findOneBy({ id: updateRecord.id })

        const result = await buildingRepo.save({
          ...building,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete Building' })
  async deleteBuilding(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Building).delete({ id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple Buildings' })
  async deleteBuildings(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Building).delete({
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple Buildings' })
  async importBuildings(
    @Arg('buildings', type => [BuildingPatch]) buildings: BuildingPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      buildings.map(async (building: BuildingPatch) => {
        const createdBuilding: Building = await tx.getRepository(Building).save({ domain, ...building })
      })
    )

    return true
  }
}
