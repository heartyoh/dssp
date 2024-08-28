import { MigrationInterface, QueryRunner } from 'typeorm'

import { logger } from '@things-factory/env'
import { Domain, getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { BuildingComplex } from '@dssp/building-complex'
import { Project, ProjectStatus } from '../service/project/project'

const SEED_SAMPLE_BUILDING_COMPLEX = {
  address: '서울시 마포구 공덕동 아파트 17번지',
  longitude: 37.548239525193,
  latitude: 126.95315808838,
  clientCompany: 'A 고객',
  constructionCompany: 'B 건설',
  supervisoryComapny: 'C 감리',
  designCompany: 'D 디자인',
  constructionType: '아파트',
  etc: '',
  householdCount: 500,
  buildingCount: 5,
  notice: '',
  planXScale: 20,
  planYScale: 20,
  area: 22700
}

const SEED_SAMPLE_PROJECT = {
  name: '서울시 마포구 공덕동 아파트 신축공사',
  state: ProjectStatus.ONGOING,
  startDate: '2024-01-01',
  endDate: '2025-12-31',
  totalProgress: 40,
  weeklyProgress: 37
}

export class SeedSampleProject1723861478420 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const buildingRepository = getRepository(BuildingComplex)
    const projectRepository = getRepository(Project)
    const domainRepository = getRepository(Domain)
    const userRepository = getRepository(User)

    const domain: Domain = await domainRepository.findOne({
      where: { name: 'SYSTEM' }
    })
    const user = await userRepository.findOne({ where: { id: domain.owner } })

    try {
      const buildingComplex = await buildingRepository.save({
        domain,
        ...SEED_SAMPLE_BUILDING_COMPLEX,
        creator: user,
        updater: user
      })

      const project = await projectRepository.save({
        domain,
        ...SEED_SAMPLE_PROJECT,
        buildingComplex,
        creator: user,
        updater: user
      })
    } catch (e) {
      logger.error(e)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const domainRepository = getRepository(Domain)

    const domain: Domain = await domainRepository.findOne({
      where: { name: 'SYSTEM' }
    })

    const repository = getRepository(Project)

    let project = await repository.findOne({ where: { name: SEED_SAMPLE_PROJECT.name, domain: { id: domain.id } } })
    project && (await repository.remove(project))

    const buildRepository = getRepository(BuildingComplex)

    let buildingComplex = await buildRepository.findOne({
      where: { address: SEED_SAMPLE_BUILDING_COMPLEX.address, domain: { id: domain.id } }
    })
    buildingComplex && (await buildRepository.remove(buildingComplex))
  }
}
