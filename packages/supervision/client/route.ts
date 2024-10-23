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

    case 'building-inspection-detail-drawing':
      import('./pages/building-inspection/building-inspection-detail-drawing')
      return page

    case 'building-inspection-detail-checklist':
      import('./pages/building-inspection/building-inspection-detail-checklist')
      return page

    case 'building-inspection-detail-camera':
      import('./pages/building-inspection/building-inspection-detail-camera')
      return page
  }
}
