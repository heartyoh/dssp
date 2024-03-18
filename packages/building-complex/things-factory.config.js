import route from './dist-client/route'
import bootstrap from './dist-client/bootstrap'

export default {
  route,
  routes: [
    { tagname: 'building-complex-main', page: 'building-complex-main' },
    { tagname: 'building-complex-list-page', page: 'building-complex-list' },
    { tagname: 'building-list-page', page: 'building-list' },
    { tagname: 'build-level-list-page', page: 'build-level-list' },
    { tagname: 'building-level-list-page', page: 'building-level-list' }
  ],
  bootstrap
}
