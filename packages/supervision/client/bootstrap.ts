import { store } from '@operato/shell'
import supervision from './reducers/main'

export default function bootstrap() {
  store.addReducers({
    supervision
  })
}
