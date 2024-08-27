import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { Resource } from './resource'
import { NewResource, ResourcePatch } from './resource-type'

@Resolver(Resource)
export class ResourceMutation {
  @Directive('@transaction')
  @Mutation(returns => Resource, { description: 'To create new Resource' })
  async createResource(@Arg('resource') resource: NewResource, @Ctx() context: ResolverContext): Promise<Resource> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(Resource).save({
      ...resource,
      domain,
      creator: user,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Resource, { description: 'To modify Resource information' })
  async updateResource(
    @Arg('id') id: string,
    @Arg('patch') patch: ResourcePatch,
    @Ctx() context: ResolverContext
  ): Promise<Resource> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(Resource)
    const resource = await repository.findOne({
      where: { domain: { id: domain.id }, id }
    })

    const result = await repository.save({
      ...resource,
      ...patch,
      updater: user
    })

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [Resource], { description: "To modify multiple Resources' information" })
  async updateMultipleResource(
    @Arg('patches', type => [ResourcePatch]) patches: ResourcePatch[],
    @Ctx() context: ResolverContext
  ): Promise<Resource[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const resourceRepo = tx.getRepository(Resource)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await resourceRepo.save({
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
        const resource = await resourceRepo.findOneBy({ id: updateRecord.id })

        const result = await resourceRepo.save({
          ...resource,
          ...updateRecord,
          updater: user
        })

        results.push({ ...result, cuFlag: 'M' })
      }
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete Resource' })
  async deleteResource(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Resource).delete({ domain: { id: domain.id }, id })

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple Resources' })
  async deleteResources(@Arg('ids', type => [String]) ids: string[], @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Resource).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple Resources' })
  async importResources(
    @Arg('resources', type => [ResourcePatch]) resources: ResourcePatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      resources.map(async (resource: ResourcePatch) => {
        const createdResource: Resource = await tx.getRepository(Resource).save({ domain, ...resource })
      })
    )

    return true
  }
}
