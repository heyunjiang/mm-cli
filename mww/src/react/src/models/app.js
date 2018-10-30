import { query } from '../services/app'

export default {
  namespace: 'app',
  state: {},
  subscriptions: {
    setup ({ dispatch, history }) {
      dispatch({ type: 'query' })
    },
  },
  effects: {
    *query ({ payload, }, { call, put }) {},
    *saveState ({ payload }, { put, call }){
      yield put({ type: 'updateState', payload, })
    },
  },
  reducers: {
    updateState (state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    }
  },
}
