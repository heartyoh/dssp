import { MigrationInterface, QueryRunner } from 'typeorm'

import { logger } from '@things-factory/env'
import { Domain, getRepository } from '@things-factory/shell'
import { Privilege, Role, User } from '@things-factory/auth-base'

const SEED_ROLES = [
  {
    name: '감리사',
    description: '감리사',
    privileges: [
      {
        name: 'query',
        category: 'board'
      },
      {
        name: 'query',
        category: 'attachment'
      }
    ]
  },
  {
    name: '설계사',
    description: '설계사',
    privileges: [
      {
        name: 'query',
        category: 'board'
      },
      {
        name: 'query',
        category: 'attachment'
      }
    ]
  },
  {
    name: '현장관리자',
    description: '현장관리자',
    privileges: [
      {
        name: 'query',
        category: 'board'
      },
      {
        name: 'query',
        category: 'attachment'
      }
    ]
  },
  {
    name: '시공자',
    description: '시공자',
    privileges: [
      {
        name: 'query',
        category: 'board'
      },
      {
        name: 'query',
        category: 'attachment'
      }
    ]
  }
]

export class Roles1723861466413 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const domainRepository = getRepository(Domain)
    const roleRepository = getRepository(Role)
    const userRepository = getRepository(User)
    const privilegeRepository = getRepository(Privilege)

    const domain: Domain = await domainRepository.findOne({
      where: { name: 'SYSTEM' }
    })

    const admin: User = await userRepository.findOne({
      where: { email: 'admin@hatiolab.com' }
    })

    try {
      for (let i = 0; i < SEED_ROLES.length; i++) {
        const { name, description, privileges } = SEED_ROLES[i]

        const role = await roleRepository.save({
          domain,
          name,
          description,
          creator: admin,
          updater: admin
        })

        const ps = []

        for (const privilege of privileges) {
          const { name, category } = privilege
          ps.push(
            await privilegeRepository.findOne({
              where: {
                name,
                category
              }
            })
          )
        }

        role.privileges = ps

        await roleRepository.save(role)
      }
    } catch (e) {
      logger.error(e)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const domainRepository = getRepository(Domain)
    const roleRepository = getRepository(Role)

    const domain: Domain = await domainRepository.findOne({
      where: { name: 'SYSTEM' }
    })

    SEED_ROLES.reverse().forEach(async ({ name }) => {
      await roleRepository.delete({ name, domain: { id: domain.id } })
    })
  }
}
