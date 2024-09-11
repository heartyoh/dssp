export default function route(page: string) {
  switch (page) {
    case 'checklist-template-list':
      import('./pages/checklist-template/checklist-template-list')
      return page

    case 'checklist-type-management':
      import('./pages/checklist-template/checklist-type-management')
      return page

    case 'building-inspection-list':
      import('./pages/building-inspection/building-inspection-list')
      return page
  }
}
