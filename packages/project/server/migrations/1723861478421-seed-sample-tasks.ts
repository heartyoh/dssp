import { MigrationInterface, QueryRunner } from 'typeorm'

import { logger } from '@things-factory/env'
import { Domain, getRepository } from '@things-factory/shell'
import { User } from '@things-factory/auth-base'
import { Project } from '../service/project/project'

import { importTasks } from '../controllers/import-task'

const SEED_SAMPLE_PROJECT = {
  name: '서울시 마포구 공덕동 아파트 신축공사'
}

const SEED_SAMPLE_TASKS = [
  {
    code: '골조공사',
    title: '골조공사',
    progress: 60,
    children: [
      {
        code: '골조공사:기초공사',
        title: '기초공사',
        startDate: '2024-01-01',
        duration: 3,
        resources: [{ type: '철근/형틀공', allocated: 6 }]
      },
      {
        code: '골조공사:1층',
        title: '1층',
        duration: 10,
        dependsOn: '골조공사:기초공사',
        resources: [{ type: '철근/형틀공', allocated: 6 }]
      },
      {
        code: '골조공사:2층',
        title: '2층',
        duration: 10,
        dependsOn: '골조공사:1층',
        resources: [{ type: '철근/형틀공', allocated: 6 }]
      },
      {
        code: '골조공사:옥탑공사',
        title: '옥탑공사',
        duration: 6,
        dependsOn: '골조공사:2층',
        resources: [{ type: '철근/형틀공', allocated: 6 }]
      }
    ]
  },
  {
    code: '단열공사',
    title: '단열공사',
    children: [
      {
        code: '단열공사:단열재부착',
        title: '단열재부착',
        startDate: '2024-01-12',
        duration: 2
      }
    ]
  },
  {
    code: '조적공사',
    title: '조적공사',
    children: [
      {
        code: '조적공사:조적시공',
        title: '조적시공',
        startDate: '2024-01-12',
        duration: 3
      }
    ]
  },
  {
    code: '창호공사',
    title: '창호공사',
    progress: 60,
    children: [
      {
        code: '창호공사:실측및발주',
        title: '실측및발주',
        dependsOn: '골조공사:1층',
        duration: 1
      },
      {
        code: '창호공사:창호 프레임 설치',
        title: '창호 프레임 설치',
        duration: 3,
        dependsOn: '창호공사:실측및발주',
        resources: [{ type: '창호공', allocated: 4 }]
      },
      {
        code: '창호공사:창호 유리 설치',
        title: '창호 유리 설치',
        duration: 2,
        dependsOn: '창호공사:창호 프레임 설치',
        resources: [{ type: '창호공', allocated: 2 }]
      }
    ]
  },
  {
    code: '방수공사',
    title: '방수공사',
    progress: 60,
    children: [
      {
        code: '방수공사:골조 조인트부분 방수',
        title: '골조 조인트부분 방수',
        startDate: '2024-01-01',
        duration: 3,
        resources: [{ type: '방수공', allocated: 1 }]
      },
      {
        code: '방수공사:개구부 주변 방수',
        title: '개구부 주변 방수',
        duration: 2,
        dependsOn: '방수공사:골조 조인트부분 방수',
        resources: [{ type: '방수공', allocated: 1 }]
      },
      {
        code: '방수공사:테라스 방수',
        title: '테라스 방수',
        duration: 5,
        dependsOn: '방수공사:개구부 주변 방수',
        resources: [{ type: '방수공', allocated: 1 }]
      },
      {
        code: '방수공사:화장실/다용도실 방수',
        title: '화장실/다용도실 방수',
        duration: 5,
        dependsOn: '방수공사:테라스 방수',
        resources: [{ type: '방수공', allocated: 1 }]
      }
    ]
  },
  {
    code: '내부목공사',
    title: '내부목공사',
    progress: 60,
    children: [
      {
        code: '내부목공사:벽체다루끼/경량스터드',
        title: '벽체다루끼/경량스터드',
        startDate: '2024-01-20',
        duration: 5,
        resources: [{ type: '목공', allocated: 4 }]
      },
      {
        code: '내부목공사:벽체 석고보드 취부',
        title: '벽체 석고보드 취부',
        duration: 5,
        dependsOn: '내부목공사:벽체다루끼/경량스터드',
        resources: [{ type: '목공', allocated: 4 }]
      },
      {
        code: '내부목공사:ABC',
        title: 'ABC',
        duration: 4,
        dependsOn: '내부목공사:벽체 석고보드 취부',
        resources: [{ type: '목공', allocated: 4 }]
      }
    ]
  }
]

export class SeedSampleTasks1723861478421 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const projectRepository = getRepository(Project)
    const domainRepository = getRepository(Domain)
    const userRepository = getRepository(User)

    const domain: Domain = await domainRepository.findOne({
      where: { name: 'SYSTEM' }
    })
    const user = await userRepository.findOne({ where: { id: domain.owner } })
    const project = await projectRepository.findOne({ where: { domain: { id: domain.id }, name: SEED_SAMPLE_PROJECT.name } })

    try {
      await importTasks(project, SEED_SAMPLE_TASKS, { state: { domain, user } as any })
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
  }
}
