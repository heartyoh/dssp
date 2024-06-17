import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Building } from './building'
import { BuildingLevel } from '../building-level/building-level'

@Resolver(Building)
export class BuildingQuery {
  @FieldResolver(type => Attachment)
  async drawing(@Root() building: Building): Promise<Attachment | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: { refBy: building.id }
    })

    return attachment
  }

  @FieldResolver(type => [BuildingLevel])
  async buildingLevels(@Root() building: Building): Promise<BuildingLevel[]> {
    return await getRepository(BuildingLevel).findBy({ building: { id: building.id } })
  }
}
