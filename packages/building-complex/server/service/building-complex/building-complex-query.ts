import { Resolver, Query, FieldResolver, Root, Args, Arg, Ctx, Directive } from 'type-graphql'
import { Attachment } from '@things-factory/attachment-base'
import { Domain, getQueryBuilderFromListParams, getRepository, ListParam } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingComplex } from './building-complex'

@Resolver(BuildingComplex)
export class BuildingComplexQuery {
  @Query(returns => BuildingComplex!, { nullable: true, description: 'To fetch a BuildingComplex' })
  async buildingBuildingComplex(@Arg('id') id: string, @Ctx() context: ResolverContext): Promise<BuildingComplex> {
    const { domain } = context.state

    return await getRepository(BuildingComplex).findOne({
      where: { domain: { id: domain.id }, id }
    })
  }

  @FieldResolver(type => Domain)
  async domain(@Root() buildingComplex: BuildingComplex): Promise<Domain> {
    return await getRepository(Domain).findOneBy({ id: buildingComplex.domainId })
  }

  @FieldResolver(type => User)
  async updater(@Root() buildingComplex: BuildingComplex): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingComplex.updaterId })
  }

  @FieldResolver(type => User)
  async creator(@Root() buildingComplex: BuildingComplex): Promise<User> {
    return await getRepository(User).findOneBy({ id: buildingComplex.creatorId })
  }
}
