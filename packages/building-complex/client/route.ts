export default function route(page: string) {
  switch (page) {
    case 'building-complex-detail':
      import('./pages/building-complex/building-complex-detail')
      return page

    case 'building-inspection':
      import('./pages/building-inspection/building-inspection')
      return page
  }
}
