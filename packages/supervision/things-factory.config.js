import route from './dist-client/route'
import bootstrap from './dist-client/bootstrap'

export default {
  route,
  routes: [
    'checklist-template-list', // 체크리스트 템플릿
    'checklist-type-management', // 체크리스트 구분 관리
    'building-inspection-list', // 층 검측 현황
    'building-inspection-detail-drawing', // 층 검측 상세 - 검측 도면
    'building-inspection-detail-checklist', // 층 검측 상세 - 검측 체크리스트
    'building-inspection-detail-camera' // 층 검측 상세 - 사진 촬영
  ].map(page => {
    return {
      page,
      tagname: page
    }
  }),
  bootstrap
}
