import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'
import { deleteAttachmentsByRef } from '@things-factory/attachment-base'
import { ConstructionDetailType } from './construction-detail-type'
import { ConstructionDetailTypePatch } from './construction-detail-type-type'
import { ConstructionType } from '../construction-type/construction-type'

@Resolver(ConstructionDetailType)
export class ConstructionDetailTypeMutation {
  @Directive('@transaction')
  @Mutation(returns => [ConstructionDetailType], { description: "To modify multiple ConstructionDetailTypes' information" })
  async updateMultipleConstructionDetailType(
    @Arg('patches', type => [ConstructionDetailTypePatch]) patches: ConstructionDetailTypePatch[],
    @Arg('constructionTypeId') constructionTypeId: string,
    @Ctx() context: ResolverContext
  ): Promise<ConstructionDetailType[]> {
    const { domain, user, tx } = context.state

    let results = []

    const constructionDetailTypeRepo = tx.getRepository(ConstructionDetailType)
    const constructionType = await tx.getRepository(ConstructionType).findOneBy({ id: constructionTypeId })

    await constructionDetailTypeRepo.delete({ constructionType: { id: constructionTypeId } })

    for (let i = 0; i < patches.length; i++) {
      const result = await constructionDetailTypeRepo.save({
        ...patches[i],
        sequence: i,
        constructionType,
        creator: user,
        updater: user
      })

      results.push({ ...result, cuFlag: '+' })
    }

    return results
  }

  @Directive('@transaction')
  @Mutation(returns => Boolean, { description: 'To delete multiple ConstructionDetailTypes' })
  async deleteConstructionDetailTypes(
    @Arg('ids', type => [String]) ids: string[],
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    const { domain, tx } = context.state

    await tx.getRepository(ConstructionDetailType).delete({
      id: In(ids)
    })

    await deleteAttachmentsByRef(null, { refBys: ids }, context)

    return true
  }
}
