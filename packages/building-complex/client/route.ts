export default function route(page: string) {
  switch (page) {
    case 'building-complex-main':
      import('./pages/main')
      return page

    case 'building-complex-list':
      import('./pages/building-complex/building-complex-list-page')
      return page

    case 'building-list':
      import('./pages/building/building-list-page')
      return page

    case 'building-level-list':
      import('./pages/building-level/building-level-list-page')
      return page
  }
}
