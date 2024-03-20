import { store } from '@operato/shell'
import complex from './reducers/main'

export default function bootstrap() {
  store.addReducers({
    complex
  })
}
