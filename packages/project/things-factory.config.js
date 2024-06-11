import route from './dist-client/route'

export default {
  route,
  routes: [
    'project-list', // 진행중 리스트
    'project-finished-list', // 완료 리스트
    'project-setting-list', // 셋팅 리스트
    'project-update', // 프로젝트 정보 관리
    'project-plan-management', // 프로젝트 도면 관리
  ].map(page => {
    return {
      page,
      tagname: page
    }
  })
}
