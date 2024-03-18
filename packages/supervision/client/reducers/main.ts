import { UPDATE_SUPERVISION } from '../actions/main'

const INITIAL_STATE = {
  supervision: 'ABC'
}

const supervision = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_SUPERVISION:
      return { ...state }

    default:
      return state
  }
}

export default supervision
