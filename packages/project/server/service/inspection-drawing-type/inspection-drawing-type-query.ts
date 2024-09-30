import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { InspectionDrawingType } from './inspection-drawing-type'
import { InspectionDrawingTypeList } from './inspection-drawing-type-type'
import { InspectionPart } from '../inspection-part/inspection-part'

@Resolver(InspectionDrawingType)
export class InspectionDrawingTypeQuery {
  @Query(returns => InspectionDrawingType!, { nullable: true, description: 'To fetch a InspectionDrawingType' })
  async inspectionDrawingType(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<InspectionDrawingType> {
    const { domain } = context.state

    return await getRepository(InspectionDrawingType).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @Query(returns => InspectionDrawingTypeList, { description: 'To fetch multiple InspectionDrawingTypes' })
  async inspectionDrawingTypes(
    @Args(type => ListParam) params: ListParam,
    @Ctx() context: ResolverContext
  ): Promise<InspectionDrawingTypeList> {
    const { domain } = context.state

    const queryBuilder = getQueryBuilderFromListParams({
      domain,
      params,
      repository: await getRepository(InspectionDrawingType),
      searchables: ['name']
    })

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total }
  }

  @FieldResolver(type => [InspectionPart])
  async inspectionParts(@Root() inspectionDrawingType: InspectionDrawingType): Promise<InspectionPart[]> {
    return await getRepository(InspectionPart).find({
      where: { inspectionDrawingType: { id: inspectionDrawingType.id } },
      order: { sequence: 'ASC' }
    })
  }

  @FieldResolver(type => User)
  async updater(@Root() inspectionDrawingType: InspectionDrawingType): Promise<User> {
    return inspectionDrawingType.updaterId && (await getRepository(User).findOneBy({ id: inspectionDrawingType.updaterId }))
  }

  @FieldResolver(type => User)
  async creator(@Root() inspectionDrawingType: InspectionDrawingType): Promise<User> {
    return inspectionDrawingType.creatorId && (await getRepository(User).findOneBy({ id: inspectionDrawingType.creatorId }))
  }
}
