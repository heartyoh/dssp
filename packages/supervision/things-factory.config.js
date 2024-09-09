import route from './dist-client/route'
import bootstrap from './dist-client/bootstrap'

export default {
  route,
  routes: [
    'checklist-template-list', // 체크리스트 템플릿
    'checklist-type-management', // 체크리스트 구분 관리
  ].map(page => {
    return {
      page,
      tagname: page
    }
  }),
  bootstrap
}
