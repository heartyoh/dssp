export default function route(page: string) {
  switch (page) {
    case 'project-list':
      import('./pages/project/project-list')
      return page

    case 'project-detail':
      import('./pages/project/project-detail')
      return page

    case 'project-schedule-list':
      import('./pages/project/project-schedule-list')
      return page

    case 'project-schedule':
      import('./pages/project/project-schedule')
      return page

    case 'project-setting-list':
      import('./pages/project/project-setting-list')
      return page

    case 'project-update':
      import('./pages/project/project-update')
      return page

    case 'project-plan-management':
      import('./pages/project/project-plan-management')
      return page

    case 'manager-management':
      import('./pages/resource/manager-management')
      return page

    case 'worker-type-management':
      import('./pages/resource/worker-type-management')
      return page

    case 'construction-type-management':
      import('./pages/resource/construction-type-management')
      return page

    case 'resource-list':
      import('./pages/resource/resource-list-page')
      return page

    case 'task-resource-list':
      import('./pages/task-resource/task-resource-list-page')
      return page
  }
}
