import route from './dist-client/route'
import bootstrap from './dist-client/bootstrap'

export default {
  route,
  routes: [
    'building-complex-detail', // 동별 시공검측 상세 정보
    'building-complex-inspection', // 층 검측 상세
  ].map(page => {
    return {
      page,
      tagname: page
    }
  }),
  bootstrap
}
