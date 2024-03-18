export default function route(page: string) {
  switch (page) {
    case 'supervision-main':
      import('./pages/main')
      return page
  
    case 'supervisor-list':
      import('./pages/supervisor/supervisor-list-page')
      return page
  
    case 'project-report-list':
      import('./pages/project-report/project-report-list-page')
      return page
  
    case 'check-item-list':
      import('./pages/check-item/check-item-list-page')
      return page
  
    case 'issue-list':
      import('./pages/issue/issue-list-page')
      return page
  
    case 'action-plan-list':
      import('./pages/action-plan/action-plan-list-page')
      return page
  }
}
