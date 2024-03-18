import route from './dist-client/route'
import bootstrap from './dist-client/bootstrap'

export default {
  route,
  routes: [
    { tagname: 'supervision-main', page: 'supervision-main' },
    { tagname: 'supervisor-list-page', page: 'supervisor-list' },
    { tagname: 'project-report-list-page', page: 'project-report-list' },
    { tagname: 'check-item-list-page', page: 'check-item-list' },
    { tagname: 'issue-list-page', page: 'issue-list' },
    { tagname: 'action-plan-list-page', page: 'action-plan-list' }
  ],
  bootstrap
}
