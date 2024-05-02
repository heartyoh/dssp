import contentDisposition from 'content-disposition'

import { Task, generateExcel } from './controllers/project-to-excel'

// const debug = require('debug')('dssp:project:routes')

process.on('bootstrap-module-global-public-route' as any, (app, globalPublicRouter) => {
  /*
   * can add global public routes to application (auth not required, tenancy not required)
   *
   * ex) routes.get('/path', async(context, next) => {})
   * ex) routes.post('/path', async(context, next) => {})
   */
  globalPublicRouter.get('/export-project', async (context, next) => {
    const tasks: Task[] = [
      {
        name: '1 Task',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-05'),
        subtasks: [
          {
            name: '1.1 Subtask',
            startDate: new Date('2024-03-02'),
            endDate: new Date('2024-03-03'),
            subtasks: [
              {
                name: '1.1.1 Subtask',
                startDate: new Date('2024-03-02'),
                endDate: new Date('2024-03-02')
              },
              {
                name: '1.1.2 Subtask',
                startDate: new Date('2024-03-02'),
                endDate: new Date('2024-03-03')
              },
              {
                name: '1.1.2 Subtask',
                startDate: new Date('2024-03-03'),
                endDate: new Date('2024-03-03')
              },
              {
                name: '1.1.2 Subtask',
                startDate: new Date('2024-03-03'),
                endDate: new Date('2024-03-03')
              }
            ]
          },
          {
            name: '1.2 Subtask',
            startDate: new Date('2024-03-04'),
            endDate: new Date('2024-03-05')
          }
        ]
      },
      {
        name: '2 Task',
        startDate: new Date('2024-03-06'),
        endDate: new Date('2024-03-10'),
        subtasks: [
          {
            name: '2.1 Subtask',
            startDate: new Date('2024-03-06'),
            endDate: new Date('2024-03-07')
          },
          {
            name: '2.2 Subtask',
            startDate: new Date('2024-03-08'),
            endDate: new Date('2024-03-10'),
            subtasks: [
              {
                name: '2.2.1 Subtask',
                startDate: new Date('2024-03-08'),
                endDate: new Date('2024-03-09')
              },
              {
                name: '2.2.2 Subtask',
                startDate: new Date('2024-03-10'),
                endDate: new Date('2024-03-10')
              }
            ]
          }
        ]
      }
    ]

    context.type = 'application/xlsx'
    context.set('Content-Disposition', contentDisposition(`project.xlsx`))
    context.body = await generateExcel(tasks)
  })
})

process.on('bootstrap-module-global-private-route' as any, (app, globalPrivateRouter) => {
  /*
   * can add global private routes to application (auth required, tenancy not required)
   */
})

process.on('bootstrap-module-domain-public-route' as any, (app, domainPublicRouter) => {
  /*
   * can add domain public routes to application (auth not required, tenancy required)
   */
})

process.on('bootstrap-module-domain-private-route' as any, (app, domainPrivateRouter) => {
  /*
   * can add domain private routes to application (auth required, tenancy required)
   */
})
