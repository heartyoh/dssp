import { MigrationInterface, QueryRunner } from 'typeorm'

import { logger } from '@things-factory/env'
import { Domain, getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { CommonCode, CommonCodeDetail } from '@things-factory/code-base'

const SEED_COMMON_CODES = [
  {
    name: 'EMPLOYEE_TYPE',
    description: '직원 유형',
    details: [
      {
        name: 'FULLTIME',
        description: '풀타임 정규직',
        labels: null,
        rank: 1
      },
      {
        name: 'PARTTIME',
        description: '파트타임 정규직',
        labels: null,
        rank: 2
      },
      {
        name: 'TEMPORARY',
        description: '임시직',
        labels: null,
        rank: 3
      }
    ]
  },
  {
    name: 'JOB_POSITION',
    description: '직급',
    details: [
      {
        name: '임원',
        description: '임원',
        labels: null,
        rank: 1
      },
      {
        name: '직원',
        description: '직원',
        labels: null,
        rank: 2
      }
    ]
  },
  {
    name: 'JOB_RESPONSIBILITY',
    description: '직책',
    details: [
      {
        name: 'ADMIN',
        description: '관리자',
        labels: null,
        rank: 1
      },
      {
        name: 'OVERALL_SUPERVISORY',
        description: '총괄 감리 책임자',
        labels: null,
        rank: 2
      },
      {
        name: 'TASK_SUPERVISORY',
        description: '공종별 감리 책임자',
        labels: null,
        rank: 3
      },
      {
        name: 'OVERALL_CONSTRUCTOR',
        description: '총괄 시공 책임자',
        labels: null,
        rank: 4
      },
      {
        name: 'TASK_CONSTRUCTOR',
        description: '공종별 시공 관리자',
        labels: null,
        rank: 5
      },
      {
        name: 'DESIGNER',
        description: '설계사',
        labels: null,
        rank: 6
      },
      {
        name: 'CONSTRUCTOR',
        description: '시공자',
        labels: null,
        rank: 7
      }
    ]
  }
]

export class SeedCodes1723861466414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const commonCodeRepository = getRepository(CommonCode)
    const commonCodeDetailRepository = getRepository(CommonCodeDetail)
    const domainRepository = getRepository(Domain)
    const userRepository = getRepository(User)

    const domain: Domain = await domainRepository.findOne({
      where: { name: 'SYSTEM' }
    })
    const user = await userRepository.findOne({ where: { id: domain.owner } })

    try {
      for (let i = 0; i < SEED_COMMON_CODES.length; i++) {
        const { name, description, details } = SEED_COMMON_CODES[i]

        const commonCode = await commonCodeRepository.save({
          domain,
          name,
          description,
          creator: user,
          updater: user
        })

        for (const commonCodeDetail of details) {
          const { name, description, labels, rank } = commonCodeDetail

          await commonCodeDetailRepository.save({
            domain,
            commonCode,
            name,
            description,
            labels,
            rank
          })
        }
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

    const repository = getRepository(CommonCode)

    SEED_COMMON_CODES.reverse().forEach(async commonCode => {
      let record = await repository.findOne({ where: { name: commonCode.name, domain: { id: domain.id } } })
      record && (await repository.remove(record))
    })
  }
}
