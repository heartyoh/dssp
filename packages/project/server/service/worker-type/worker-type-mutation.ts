import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { WorkerType } from './worker-type'
import { WorkerTypePatch } from './worker-type-type'

@Resolver(WorkerType)
export class WorkerTypeMutation {
  @Directive('@transaction')
  @Mutation(returns => [WorkerType], { description: "To modify multiple WorkerTypes' information" })
  async updateMultipleWorkerType(
    @Arg('patches', type => [WorkerTypePatch]) patches: WorkerTypePatch[],
    @Ctx() context: ResolverContext
  ): Promise<WorkerType[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const workerTypeRepo = tx.getRepository(WorkerType)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await workerTypeRepo.save({
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
        const workerType = await workerTypeRepo.findOneBy({ id: updateRecord.id })

        const result = await workerTypeRepo.save({
          ...workerType,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple WorkerTypes' })
  async deleteWorkerTypes(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(WorkerType).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    return true
  }
}
