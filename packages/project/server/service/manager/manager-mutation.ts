import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { Manager } from './manager'
import { ManagerPatch } from './manager-type'
import { User } from '@things-factory/auth-base'

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
    const userRepo = tx.getRepository(User)

    for (let i = 0; i < patches.length; i++) {
      const updateRecord = patches[i]
      const manager = updateRecord.id ? await managerRepo.findOneBy({ id: updateRecord.id }) : {}
      const user = await userRepo.findOneBy({ id: updateRecord.userId })

      await userRepo.save({
        ...user,
        name: updateRecord.name
      })

      const result = await managerRepo.save({
        ...manager,
        user: user,
        ...updateRecord
      })

      results.push({ ...result })
    }

    return results
  }
}
