export default function route(page: string) {
  switch (page) {
  
    case 'project-list':
      import('./pages/project/project-list-page')
      return page
  
    case 'task-list':
      import('./pages/task/task-list-page')
      return page
  }
}
