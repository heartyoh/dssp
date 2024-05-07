import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { BuildingLevel } from './building-level'
import { NewBuildingLevel, BuildingLevelPatch } from './building-level-type'

@Resolver(BuildingLevel)
export class BuildingLevelMutation {
  @Directive('@transaction')
  @Mutation(returns => BuildingLevel, { description: 'To create new BuildingLevel' })
  async createBuildingLevel(
    @Arg('buildingLevel') buildingLevel: NewBuildingLevel,
    @Ctx() context: ResolverContext
  ): Promise<BuildingLevel> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(BuildingLevel).save({
      ...buildingLevel,
      domain,
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => BuildingLevel, { description: 'To modify BuildingLevel information' })
  async updateBuildingLevel(
    @Arg('id') id: string,
    @Arg('patch') patch: BuildingLevelPatch,
    @Ctx() context: ResolverContext
  ): Promise<BuildingLevel> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(BuildingLevel)
    const buildingLevel = await repository.findOne({
      where: { id }
    })

    const result = await repository.save({
      ...buildingLevel,
      ...patch,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [BuildingLevel], { description: "To modify multiple BuildingLevels' information" })
  async updateMultipleBuildingLevel(
    @Arg('patches', type => [BuildingLevelPatch]) patches: BuildingLevelPatch[],
    @Ctx() context: ResolverContext
  ): Promise<BuildingLevel[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const buildingLevelRepo = tx.getRepository(BuildingLevel)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await buildingLevelRepo.save({
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
        const buildingLevel = await buildingLevelRepo.findOneBy({ id: updateRecord.id })

        const result = await buildingLevelRepo.save({
          ...buildingLevel,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete BuildingLevel' })
  async deleteBuildingLevel(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(BuildingLevel).delete({ id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple BuildingLevels' })
  async deleteBuildingLevels(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(BuildingLevel).delete({
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple BuildingLevels' })
  async importBuildingLevels(
    @Arg('buildingLevels', type => [BuildingLevelPatch]) buildingLevels: BuildingLevelPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      buildingLevels.map(async (buildingLevel: BuildingLevelPatch) => {
        const createdBuildingLevel: BuildingLevel = await tx
          .getRepository(BuildingLevel)
          .save({ domain, ...buildingLevel })
      })
    )

    return true
  }
}
