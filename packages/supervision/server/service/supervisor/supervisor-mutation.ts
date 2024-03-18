import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { Supervisor } from './supervisor'
import { NewSupervisor, SupervisorPatch } from './supervisor-type'

@Resolver(Supervisor)
export class SupervisorMutation {
  @Directive('@transaction')
  @Mutation(returns => Supervisor, { description: 'To create new Supervisor' })
  async createSupervisor(@Arg('supervisor') supervisor: NewSupervisor, @Ctx() context: ResolverContext): Promise<Supervisor> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(Supervisor).save({
      ...supervisor,
      domain,
      creator: user,
      updater: user
    })

    if (supervisor.thumbnail) {
      await createAttachment(
        null,
        {
          attachment: {
            file: supervisor.thumbnail,
            refType: Supervisor.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => Supervisor, { description: 'To modify Supervisor information' })
  async updateSupervisor(
    @Arg('id') id: string,
    @Arg('patch') patch: SupervisorPatch,
    @Ctx() context: ResolverContext
  ): Promise<Supervisor> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(Supervisor)
    const supervisor = await repository.findOne({
      where: { domain: { id: domain.id }, id }
    })

    const result = await repository.save({
      ...supervisor,
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
            refType: Supervisor.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [Supervisor], { description: "To modify multiple Supervisors' information" })
  async updateMultipleSupervisor(
    @Arg('patches', type => [SupervisorPatch]) patches: SupervisorPatch[],
    @Ctx() context: ResolverContext
  ): Promise<Supervisor[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const supervisorRepo = tx.getRepository(Supervisor)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await supervisorRepo.save({
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
                refType: Supervisor.name,
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
        const supervisor = await supervisorRepo.findOneBy({ id: updateRecord.id })

        const result = await supervisorRepo.save({
          ...supervisor,
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
                refType: Supervisor.name,
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
  @Mutation(returns => Boolean, { description: 'To delete Supervisor' })
  async deleteSupervisor(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Supervisor).delete({ domain: { id: domain.id }, id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple Supervisors' })
  async deleteSupervisors(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(Supervisor).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple Supervisors' })
  async importSupervisors(
    @Arg('supervisors', type => [SupervisorPatch]) supervisors: SupervisorPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      supervisors.map(async (supervisor: SupervisorPatch) => {
        const createdSupervisor: Supervisor = await tx.getRepository(Supervisor).save({ domain, ...supervisor })
      })
    )

    return true
  }
}
