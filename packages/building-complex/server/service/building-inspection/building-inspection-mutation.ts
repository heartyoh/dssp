import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { BuildingInspection } from './building-inspection'
import { NewBuildingInspection, BuildingInspectionPatch } from './building-inspection-type'

@Resolver(BuildingInspection)
export class BuildingInspectionMutation {
  @Directive('@transaction')
  @Mutation(returns => BuildingInspection, { description: 'To create new BuildingInspection' })
  async createBuildingInspection(@Arg('buildingInspection') buildingInspection: NewBuildingInspection, @Ctx() context: ResolverContext): Promise<BuildingInspection> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(BuildingInspection).save({
      ...buildingInspection,
      domain,
      creator: user,
      updater: user
    })

    if (buildingInspection.thumbnail) {
      await createAttachment(
        null,
        {
          attachment: {
            file: buildingInspection.thumbnail,
            refType: BuildingInspection.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => BuildingInspection, { description: 'To modify BuildingInspection information' })
  async updateBuildingInspection(
    @Arg('id') id: string,
    @Arg('patch') patch: BuildingInspectionPatch,
    @Ctx() context: ResolverContext
  ): Promise<BuildingInspection> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(BuildingInspection)
    const buildingInspection = await repository.findOne({
      where: { domain: { id: domain.id }, id }
    })

    const result = await repository.save({
      ...buildingInspection,
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
            refType: BuildingInspection.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [BuildingInspection], { description: "To modify multiple BuildingInspections' information" })
  async updateMultipleBuildingInspection(
    @Arg('patches', type => [BuildingInspectionPatch]) patches: BuildingInspectionPatch[],
    @Ctx() context: ResolverContext
  ): Promise<BuildingInspection[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const buildingInspectionRepo = tx.getRepository(BuildingInspection)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await buildingInspectionRepo.save({
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
                refType: BuildingInspection.name,
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
        const buildingInspection = await buildingInspectionRepo.findOneBy({ id: updateRecord.id })

        const result = await buildingInspectionRepo.save({
          ...buildingInspection,
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
                refType: BuildingInspection.name,
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
  @Mutation(returns => Boolean, { description: 'To delete BuildingInspection' })
  async deleteBuildingInspection(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(BuildingInspection).delete({ domain: { id: domain.id }, id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple BuildingInspections' })
  async deleteBuildingInspections(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(BuildingInspection).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple BuildingInspections' })
  async importBuildingInspections(
    @Arg('buildingInspections', type => [BuildingInspectionPatch]) buildingInspections: BuildingInspectionPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      buildingInspections.map(async (buildingInspection: BuildingInspectionPatch) => {
        const createdBuildingInspection: BuildingInspection = await tx.getRepository(BuildingInspection).save({ domain, ...buildingInspection })
      })
    )

    return true
  }
}
