import { UPDATE_COMPLEX } from '../actions/main'

const INITIAL_STATE = {
  complex: 'ABC'
}

const complex = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_COMPLEX:
      return { ...state }

    default:
      return state
  }
}

export default complex
