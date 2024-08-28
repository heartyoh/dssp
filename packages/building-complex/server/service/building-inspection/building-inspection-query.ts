import { Resolver, Query, FieldResolver, Root, Arg, Ctx } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { getRepository } from '@things-factory/shell'
import { BuildingInspection } from './building-inspection'

@Resolver(BuildingInspection)
export class BuildingInspectionQuery {
  @Query(returns => BuildingInspection!, { nullable: true, description: 'To fetch a BuildingInspection' })
  async buildingInspection(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<BuildingInspection> {
    return await getRepository(BuildingInspection).findOne({
      where: { id }
    })
  }

  @FieldResolver(type => [Attachment])
  async attatchments(@Root() buildingInspection: BuildingInspection): Promise<Attachment[] | undefined> {
    const attachment: Attachment[] = await getRepository(Attachment).find({
      where: {
        refType: BuildingInspection.name,
        refBy: buildingInspection.id
      }
    })
    return attachment
  }
}
