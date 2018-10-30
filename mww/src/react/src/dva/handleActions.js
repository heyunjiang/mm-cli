/*
 * reducer 合成器
 * 原理：传入 reducers object ，返回一个函数，作为 reducer；在该函数内部 reduce 执行所有 reducer
 * 与 redux.combineReducers 不同，combineReducers 为每个 reducer 保存了各自的 state，执行的时候遍历所有 reducer
 * 当前 handleActions 返回的函数作为一个 reducer ，也就是 combineReducers 的一个 reducer
 * state: 传入的 state 作为合成的 reducer 的 defaultState
 */

function identify(value) {
  return value;
}

function handleAction(actionType, reducer = identify) {
  return (state, action) => {
    const { type } = action;
    if (type && actionType !== type) {
      return state;
    }
    return reducer(state, action);
  };
}

function reduceReducers(...reducers) {
  return (previous, current) =>
    reducers.reduce(
      (p, r) => r(p, current),
      previous,
    );
}

function handleActions(handlers, defaultState) {
  const reducers = Object.keys(handlers).map(type => handleAction(type, handlers[type]));
  const reducer = reduceReducers(...reducers);
  return (state = defaultState, action) => reducer(state, action);
}

export default handleActions;
