import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { Manager } from './manager'
import { ManagerPatch } from './manager-type'

@Resolver(Manager)
export class ManagerMutation {
  @Directive('@transaction')
  @Mutation(returns => [Manager], { description: "To modify multiple Managers' information" })
  async updateMultipleManager(
    @Arg('patches', type => [ManagerPatch]) patches: ManagerPatch[],
    @Ctx() context: ResolverContext
  ): Promise<Manager[]> {
    const { tx } = context.state

    let results = []
    const managerRepo = tx.getRepository(Manager)

    for (let i = 0; i < patches.length; i++) {
      const updateRecord = patches[i]
      const manager = await managerRepo.findOneBy({ id: updateRecord.id })

      const result = await managerRepo.save({
        ...manager,
        ...updateRecord
      })

      results.push({ ...result, cuFlag: 'M' })
    }

    return results
  }
}
