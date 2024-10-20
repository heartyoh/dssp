import route from './dist-client/route'
import bootstrap from './dist-client/bootstrap'

export default {
  route,
  routes: [
    
  ].map(page => {
    return {
      page,
      tagname: page
    }
  }),
  bootstrap
}
