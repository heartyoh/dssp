import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingLevel } from './building-level'
import { BuildingLevelList } from './building-level-type'
import { BuildingInspection } from '../building-inspection/building-inspection'

@Resolver(BuildingLevel)
export class BuildingLevelQuery {
  @FieldResolver(type => Attachment)
  async planImage(@Root() buildingLevel: BuildingLevel): Promise<Attachment | undefined> {
    const attachment: Attachment = await getRepository(Attachment).findOne({
      where: {
        refType: BuildingLevel.name,
        refBy: buildingLevel.id
      }
    })

    return attachment
  }

  @FieldResolver(type => [BuildingInspection])
  async buildingInspections(@Root() buildingLevel: BuildingLevel): Promise<BuildingInspection[]> {
    return await getRepository(BuildingInspection).findBy({ buildingLevel: { id: buildingLevel.id } })
  }

  @FieldResolver(type => User)
  async creator(@Root() buildingLevel: BuildingLevel): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingLevel.creatorId })
  }
}
