import route from './dist-client/route'

export default {
  route,
  routes: ['project-list', 'project-finished-list', 'project-update', 'project-setting-list'].map(page => {
    return {
      page,
      tagname: page
    }
  })
}
