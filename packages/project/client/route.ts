export default function route(page: string) {
  switch (page) {
    case 'project-list':
      import('./pages/project/project-list-page')
      return page

    case 'project-setting-list':
      import('./pages/project/project-setting-list')
      return page

    case 'project-update':
      import('./pages/project/project-update')
      return page
  }
}
