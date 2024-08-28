import { MigrationInterface, QueryRunner } from 'typeorm'

import { logger } from '@things-factory/env'
import { Domain, getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { ResourceType, Resource } from '../service/resource/resource'

const SEED_RESOURCES = [
  { name: '철근/형틀공', type: ResourceType.HUMAN, unit: 'man/day' },
  { name: '방수공', type: ResourceType.HUMAN, unit: 'man/day' },
  { name: '목공', type: ResourceType.HUMAN, unit: 'man/day' },
  { name: '금속공', type: ResourceType.HUMAN, unit: 'man/day' },
  { name: '타일공', type: ResourceType.HUMAN, unit: 'man/day' },
  { name: '창호공', type: ResourceType.HUMAN, unit: 'man/day' },
  { name: '도배공', type: ResourceType.HUMAN, unit: 'man/day' },
  { name: '조적공', type: ResourceType.HUMAN, unit: 'man/day' }
]

export class SeedResources1723861476419 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const resourceRepository = getRepository(Resource)
    const domainRepository = getRepository(Domain)
    const userRepository = getRepository(User)

    const domain: Domain = await domainRepository.findOne({
      where: { name: 'SYSTEM' }
    })
    const user = await userRepository.findOne({ where: { id: domain.owner } })

    try {
      for (let i = 0; i < SEED_RESOURCES.length; i++) {
        const { name, type, unit } = SEED_RESOURCES[i]

        const resource = await resourceRepository.save({
          domain,
          name,
          type,
          unit,
          creator: user,
          updater: user
        })
      }
    } catch (e) {
      logger.error(e)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const domainRepository = getRepository(Domain)

    const domain: Domain = await domainRepository.findOne({
      where: { name: 'SYSTEM' }
    })

    const repository = getRepository(Resource)

    SEED_RESOURCES.reverse().forEach(async resource => {
      let record = await repository.findOne({ where: { name: resource.name, domain: { id: domain.id } } })
      record && (await repository.remove(record))
    })
  }
}
