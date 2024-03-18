import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { ProjectReport } from './project-report'
import { NewProjectReport, ProjectReportPatch } from './project-report-type'

@Resolver(ProjectReport)
export class ProjectReportMutation {
  @Directive('@transaction')
  @Mutation(returns => ProjectReport, { description: 'To create new ProjectReport' })
  async createProjectReport(@Arg('projectReport') projectReport: NewProjectReport, @Ctx() context: ResolverContext): Promise<ProjectReport> {
    const { domain, user, tx } = context.state

    const result = await tx.getRepository(ProjectReport).save({
      ...projectReport,
      domain,
      creator: user,
      updater: user
    })

    if (projectReport.thumbnail) {
      await createAttachment(
        null,
        {
          attachment: {
            file: projectReport.thumbnail,
            refType: ProjectReport.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => ProjectReport, { description: 'To modify ProjectReport information' })
  async updateProjectReport(
    @Arg('id') id: string,
    @Arg('patch') patch: ProjectReportPatch,
    @Ctx() context: ResolverContext
  ): Promise<ProjectReport> {
    const { domain, user, tx } = context.state

    const repository = tx.getRepository(ProjectReport)
    const projectReport = await repository.findOne({
      where: { domain: { id: domain.id }, id }
    })

    const result = await repository.save({
      ...projectReport,
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
            refType: ProjectReport.name,
            refBy: result.id
          }
        },
        context
      )
    }

    return result
  }

  @Directive('@transaction')
  @Mutation(returns => [ProjectReport], { description: "To modify multiple ProjectReports' information" })
  async updateMultipleProjectReport(
    @Arg('patches', type => [ProjectReportPatch]) patches: ProjectReportPatch[],
    @Ctx() context: ResolverContext
  ): Promise<ProjectReport[]> {
    const { domain, user, tx } = context.state

    let results = []
    const _createRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === '+')
    const _updateRecords = patches.filter((patch: any) => patch.cuFlag.toUpperCase() === 'M')
    const projectReportRepo = tx.getRepository(ProjectReport)

    if (_createRecords.length > 0) {
      for (let i = 0; i < _createRecords.length; i++) {
        const newRecord = _createRecords[i]

        const result = await projectReportRepo.save({
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
                refType: ProjectReport.name,
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
        const projectReport = await projectReportRepo.findOneBy({ id: updateRecord.id })

        const result = await projectReportRepo.save({
          ...projectReport,
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
                refType: ProjectReport.name,
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
  @Mutation(returns => Boolean, { description: 'To delete ProjectReport' })
  async deleteProjectReport(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ProjectReport).delete({ domain: { id: domain.id }, id })
    await deleteAttachmentsByRef(null, { refBys: [id] }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple ProjectReports' })
  async deleteProjectReports(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ProjectReport).delete({
      domain: { id: domain.id },
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To import multiple ProjectReports' })
  async importProjectReports(
    @Arg('projectReports', type => [ProjectReportPatch]) projectReports: ProjectReportPatch[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await Promise.all(
      projectReports.map(async (projectReport: ProjectReportPatch) => {
        const createdProjectReport: ProjectReport = await tx.getRepository(ProjectReport).save({ domain, ...projectReport })
      })
    )

    return true
  }
}
