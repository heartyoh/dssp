export default function route(page: string) {
  switch (page) {
    case 'building-complex-detail':
      import('./pages/building-complex/building-complex-detail')
      return page

    case 'building-complex-inspection':
      import('./pages/building-complex/building-complex-inspection')
      return page
  }
}
