import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Building } from './building'
import { BuildingLevel } from '../building-level/building-level'
import { BuildingComplex } from '../building-complex/building-complex'

@Resolver(Building)
export class BuildingQuery {
  @Query(returns => Building!, { nullable: true, description: 'To fetch a building' })
  async building(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<Building> {
    return await getRepository(Building).findOne({
      where: { id }
    })
  }

  @FieldResolver(type => Attachment)
  async drawing(@Root() building: Building): Promise<Attachment | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: { refBy: building.id }
    })

    return attachment
  }

  @FieldResolver(type => Building)
  async buildingComplex(@Root() building: Building): Promise<BuildingComplex> {
    return await getRepository(BuildingComplex).findOneBy({ id: building.buildingComplexId })
  }

  @FieldResolver(type => [BuildingLevel])
  async buildingLevels(@Root() building: Building): Promise<BuildingLevel[]> {
    return await getRepository(BuildingLevel).findBy({ building: { id: building.id } })
  }
}
