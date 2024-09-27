import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx } from 'type-graphql'
import { getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { InspectionPart } from './inspection-part'
import { InspectionPartList } from './inspection-part-type'

@Resolver(InspectionPart)
export class InspectionPartQuery {
  @Query(returns => InspectionPart!, { nullable: true, description: 'To fetch a InspectionPart' })
  async inspectionPart(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<InspectionPart> {
    return await getRepository(InspectionPart).findOne({
      where: { id }
    })
  }

  @Query(returns => InspectionPartList, { description: 'To fetch multiple InspectionParts' })
  async inspectionParts(
    @Args(type => ListParam) params: ListParam,
    @Ctx() context: ResolverContext
  ): Promise<InspectionPartList> {
    const queryBuilder = getQueryBuilderFromListParams({
      params,
      repository: await getRepository(InspectionPart),
      searchables: ['name', 'description']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => User)
  async updater(@Root() inspectionPart: InspectionPart): Promise<User> {
    return inspectionPart.updaterId && (await getRepository(User).findOneBy({ id: inspectionPart.updaterId }))
  }

  @FieldResolver(type => User)
  async creator(@Root() inspectionPart: InspectionPart): Promise<User> {
    return inspectionPart.creatorId && (await getRepository(User).findOneBy({ id: inspectionPart.creatorId }))
  }
}
