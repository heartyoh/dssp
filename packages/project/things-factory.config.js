import route from './dist-client/route'

export default {
  route,
  routes: ['project-create', 'project-setting-list'].map(page => {
    return {
      page,
      tagname: page
    }
  })
}
