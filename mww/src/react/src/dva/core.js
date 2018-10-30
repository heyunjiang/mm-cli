/*
 * 名称： redux + redux-saga + react-redux + react-router 4 + connect-react-router 综合体
 * from: dva 1.0
 * designer: heyunjiang
 * time: 2018.8.27
 * 说明： 使用方式还是跟 dva 1.0 一样，构建 namespace、state、reducer、effects、subscriptions
 * 使用的是 react-router 4 动态路由
 * update: 2018.9.03
 */

import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';

import { createBrowserHistory, createHashHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'

import createSagaMiddleware from 'redux-saga/lib/internal/middleware';
import * as sagaEffects from 'redux-saga/effects';
import isPlainObject from 'is-plain-object';
import invariant from 'invariant';
import warning from 'warning';
import flatten from 'flatten';
import window from 'global/window';
import document from 'global/document';
import {
  takeEveryHelper as takeEvery,
  takeLatestHelper as takeLatest,
  throttleHelper as throttle,
} from 'redux-saga/lib/internal/sagaHelpers';
import isFunction from 'lodash.isfunction';
import handleActions from './handleActions';
import Plugin from './plugin';

const SEP = '/';

const defaultHistory = createHashHistory()

// 设置应用的版本
const defaultConfig = {
  reactRouterVersion: '4',
  reactVersion: '16'
}

export default function createDva() {
  /**
   * Create a dva instance.
   */
  return function dva(config = {}) {
    // history and initialState does not pass to plugin
    const history = defaultHistory;
    const initialState = {};

    const plugin = new Plugin();

    const app = {
      // properties
      _models: [],
      _router: null,
      _store: null,
      _history: null,
      _plugin: plugin,
      // methods
      use,
      model,
      router,
      start,
    };
    return app;

    // //////////////////////////////////
    // Methods

    /**
     * Register an object of hooks on the application.
     *
     * @param hooks
     */
    function use(hooks) {
      plugin.use(hooks);
    }

    /**
     * Register a model.
     *
     * @param model
     */
    function model(model) {
      this._models.push(checkModel(model));
    }

    // inject model dynamically
    function injectModel(createReducer, onError, unlisteners, m) {
      m = checkModel(m);
      this._models.push(m);
      const store = this._store;

      // 问题1： store 里面保存的 asyncReducers 是什么？为什么要这么保存？
      // reducers
      store.asyncReducers[m.namespace] = getReducer(m.reducers, m.state);
      store.replaceReducer(createReducer(store.asyncReducers));
      // effects
      if (m.effects) {
        store.runSaga(getSaga(m.effects, m, onError));
      }
      // subscriptions
      if (m.subscriptions) {
        unlisteners[m.namespace] = runSubscriptions(m.subscriptions, m, this, onError);
      }
    }

    // Unexpected key warn problem:
    // https://github.com/reactjs/redux/issues/1636
    function unmodel(createReducer, reducers, _unlisteners, namespace) {
      const store = this._store;

      // Delete reducers
      delete store.asyncReducers[namespace];
      delete reducers[namespace];
      store.replaceReducer(createReducer(store.asyncReducers));
      store.dispatch({ type: '@@dva/UPDATE' });

      // Cancel effects
      store.dispatch({ type: `${namespace}/@@CANCEL_EFFECTS` });

      // unlisten subscrioptions
      if (_unlisteners[namespace]) {
        const { unlisteners, noneFunctionSubscriptions } = _unlisteners[namespace];
        warning(
          noneFunctionSubscriptions.length === 0,
          `app.unmodel: subscription should return unlistener function, check these subscriptions ${noneFunctionSubscriptions.join(', ')}`,
        );
        for (const unlistener of unlisteners) {
          unlistener();
        }
        delete _unlisteners[namespace];
      }

      // delete model from this._models
      this._models = this._models.filter(model => model.namespace !== namespace);
    }

    /**
     * Config router. Takes a function with arguments { history, dispatch },
     * and expects router config. It use the same api as react-router,
     * return jsx elements or JavaScript Object for dynamic routing.
     *
     * @param router
     */
    function router(router) {
      invariant(typeof router === 'function', 'app.router: router should be function');
      this._router = router;
    }

    /**
     * Start the application. Selector is optional. If no selector
     * arguments, it will return a function that return JSX elements.
     *
     * @param container selector | HTMLElement
     */
    function start(container) {
      // support selector
      if (typeof container === 'string') {
        container = document.querySelector(container);
        invariant(container, `app.start: could not query selector: ${container}`);
      }

      invariant(!container || isHTMLElement(container), 'app.start: container should be HTMLElement');
      invariant(this._router, 'app.start: router should be defined');

      // 默认错误处理函数，可以被实例化时传入的 onError 处理函数覆盖掉
      const onError = plugin.apply('onError', (err) => {
        // throw new Error(err.stack || err);
        // console.log(err)
      });
      const onErrorWrapper = (err) => {
        if (err) {
          if (typeof err === 'string') err = new Error(err);
          onError(err, app._store.dispatch);
        }
      };

      // 问题2： 为什么要插入这个 model，有什么用？
      // internal model for destroy
      model.call(this, {
        namespace: '@@dva',
        state: 0,
        reducers: {
          UPDATE(state) { return state + 1; },
        },
      });

      // get reducers and sagas from model
      const sagas = [];
      const reducers = {};
      for (const m of this._models) {
        reducers[m.namespace] = getReducer(m.reducers, m.state);
        if (m.effects) sagas.push(getSaga(m.effects, m, onErrorWrapper));
      }

      // extra reducers
      const extraReducers = plugin.get('extraReducers');
      invariant(
        Object.keys(extraReducers).every(key => !(key in reducers)),
        'app.start: extraReducers is conflict with other reducers',
      );

      // extra enhancers
      const extraEnhancers = plugin.get('extraEnhancers');
      invariant(
        Array.isArray(extraEnhancers),
        'app.start: extraEnhancers should be array',
      );

      // create store
      const extraMiddlewares = plugin.get('onAction');
      const reducerEnhancer = plugin.get('onReducer');
      const sagaMiddleware = createSagaMiddleware();
      let middlewares = [
        sagaMiddleware,
        ...flatten(extraMiddlewares),
      ];

      // 应用 react-router 4
      if (routerMiddleware) {
        middlewares = [routerMiddleware(history), ...middlewares];
      }

      let devtools = () => noop => noop;
      if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
        devtools = window.__REDUX_DEVTOOLS_EXTENSION__;
      }
      const enhancers = [
        applyMiddleware(...middlewares),
        devtools(),
        ...extraEnhancers,
      ];
      const store = this._store = createStore(
        createReducer(),
        initialState,
        compose(...enhancers),
      );

      // asyncReducers 属于可选 reducer
      function createReducer(asyncReducers) {
        // reducerEnhancer 的作用是用于对 reducer 进行一层包装，但是我在使用的时候就没有包装，返回的就是传入的 reducer
        return connectRouter(history)(combineReducers({
          ...reducers,
          ...extraReducers,
          ...asyncReducers,
        }));
      }

      // 扩展 store
      store.runSaga = sagaMiddleware.run;
      store.asyncReducers = {};

      const listeners = [];

      // start saga
      sagas.forEach(sagaMiddleware.run);

      if(history) {this._history = history}

      // run subscriptions
      const unlisteners = {};
      for (const model of this._models) {
        if (model.subscriptions) {
          unlisteners[model.namespace] = runSubscriptions(model.subscriptions, model, this,
            onErrorWrapper);
        }
      }

      // inject model after start
      // 此时的 model 方法已经被 injectModel 给替代了，不再是单纯的 push 了
      this.model = injectModel.bind(this, createReducer, onErrorWrapper, unlisteners);

      this.unmodel = unmodel.bind(this, createReducer, reducers, unlisteners);

      // If has container, render; else, return react component
      if (container) {
        render(container, store, this, this._router);
        plugin.apply('onHmr')(render.bind(this, container, store, this));
      } else {
        return getProvider(store, this, this._router);
      }
    }

    // //////////////////////////////////
    // Helpers

    function getProvider(store, app, router) {
      return (
        <Provider store={store}>
          {router({history: app._history, app})}
        </Provider>
      );
    }
          // { router({ app, history: app._history, ...extraProps }) }

    function render(container, store, app, router) {
      const ReactDOM = require('react-dom');
      ReactDOM.render(getProvider(store, app, router), container);
    }

    // 为 model 的 effects 和 reducer 添加前缀
    function checkModel(m) {
      // Clone model to avoid prefixing namespace multiple times
      const model = { ...m };
      const { namespace, reducers, effects } = model;

      invariant(
        namespace,
        'app.model: namespace should be defined',
      );
      invariant(
        !app._models.some(model => model.namespace === namespace),
        'app.model: namespace should be unique',
      );
      invariant(
        !model.subscriptions || isPlainObject(model.subscriptions),
        'app.model: subscriptions should be Object',
      );
      invariant(
        !reducers || isPlainObject(reducers) || Array.isArray(reducers),
        'app.model: reducers should be Object or array',
      );
      invariant(
        !Array.isArray(reducers) || (isPlainObject(reducers[0]) && typeof reducers[1] === 'function'),
        'app.model: reducers with array should be app.model({ reducers: [object, function] })',
      );
      invariant(
        !effects || isPlainObject(effects),
        'app.model: effects should be Object',
      );

      function applyNamespace(type) {
        function getNamespacedReducers(reducers) {
          return Object.keys(reducers).reduce((memo, key) => {
            warning(
              key.indexOf(`${namespace}${SEP}`) !== 0,
              `app.model: ${type.slice(0, -1)} ${key} should not be prefixed with namespace ${namespace}`,
            );
            memo[`${namespace}${SEP}${key}`] = reducers[key];
            return memo;
          }, {});
        }

        if (model[type]) {
          if (type === 'reducers' && Array.isArray(model[type])) {
            model[type][0] = getNamespacedReducers(model[type][0]);
          } else {
            model[type] = getNamespacedReducers(model[type]);
          }
        }
      }

      applyNamespace('reducers');
      applyNamespace('effects');

      return model;
    }

    function isHTMLElement(node) {
      return typeof node === 'object' && node !== null && node.nodeType && node.nodeName;
    }

    // 合并 reducer 
    function getReducer(reducers, state) {
      // Support reducer enhancer
      // e.g. reducers: [realReducers, enhancer]
      if (Array.isArray(reducers)) {
        return reducers[1](handleActions(reducers[0], state));
      } else {
        return handleActions(reducers || {}, state);
      }
    }

    // 在获取 sagas 时执行
    function getSaga(effects, model, onError) {
      // 在 sagamiddleware.run 时执行
      return function *() {
        for (const key in effects) {
          if (Object.prototype.hasOwnProperty.call(effects, key)) {
            const watcher = getWatcher(key, effects[key], model, onError);
            // 让 watcher 后台运行，所以监听 takeEvery 也是在后台监听了，执行的 effect 也是在后台执行
            // 使用 fork ,作为一个 worker
            const task = yield sagaEffects.fork(watcher);
            yield sagaEffects.fork(function *() {
              // 监听注销 model 命令，然后停止这个 task
              yield sagaEffects.take(`${model.namespace}/@@CANCEL_EFFECTS`);
              yield sagaEffects.cancel(task);
            });
          }
        }
      };
    }

    // 返回一个 generator 函数，其内部执行 effect(...args, ...sagaEffects)
    // takeEvery 监听，作为一个 watcher
    function getWatcher(key, _effect, model, onError) {
      let effect = _effect;
      let type = 'takeEvery';
      let ms;

      if (Array.isArray(_effect)) {
        effect = _effect[0];
        const opts = _effect[1];
        if (opts && opts.type) {
          type = opts.type;
          if (type === 'throttle') {
            invariant(
              opts.ms,
              'app.start: opts.ms should be defined if type is throttle',
            );
            ms = opts.ms;
          }
        }
        invariant(
          ['watcher', 'takeEvery', 'takeLatest', 'throttle'].indexOf(type) > -1,
          'app.start: effect type should be takeEvery, takeLatest, throttle or watcher',
        );
      }

      // 作为返回的主要函数
      function *sagaWithCatch(...args) {
        try {
          yield effect(...args.concat(createEffects(model)));
        } catch (e) {
          onError(e);
        }
      }

      const onEffect = plugin.get('onEffect');
      const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key);

      // 默认调用 takeEvery 一直监听
      switch (type) {
        case 'watcher':
          return sagaWithCatch;
        case 'takeLatest':
          return function*() {
            yield takeLatest(key, sagaWithOnEffect);
          };
        case 'throttle':
          return function*() {
            yield throttle(ms, key, sagaWithOnEffect);
          };
        default:
          return function*() {
            yield takeEvery(key, sagaWithOnEffect);
          };
      }
    }

    // 执行 model.subscription
    function runSubscriptions(subs, model, app, onError) {
      const unlisteners = [];
      const noneFunctionSubscriptions = [];
      for (const key in subs) {
        if (Object.prototype.hasOwnProperty.call(subs, key)) {
          const sub = subs[key];
          invariant(typeof sub === 'function', 'app.start: subscription should be function');
          const unlistener = sub({
            dispatch: createDispatch(app._store.dispatch, model),
            history: app._history,
          }, onError);
          if (isFunction(unlistener)) {
            unlisteners.push(unlistener);
          } else {
            noneFunctionSubscriptions.push(key);
          }
        }
      }
      return { unlisteners, noneFunctionSubscriptions };
    }

    // 加前缀的函数
    function prefixType(type, model) {
      const prefixedType = `${model.namespace}${SEP}${type}`;
      if ((model.reducers && model.reducers[prefixedType])
        || (model.effects && model.effects[prefixedType])) {
        return prefixedType;
      }
      return type;
    }

    // hoc for sagaEffects，修改 sagaEffects.put 默认的 type 参数，加namespace前缀
    function createEffects(model) {
      function put(action) {
        const { type } = action;
        invariant(type, 'dispatch: action should be a plain Object with type');
        warning(
          type.indexOf(`${model.namespace}${SEP}`) !== 0,
          `effects.put: ${type} should not be prefixed with namespace ${model.namespace}`,
        );
        return sagaEffects.put({ ...action, type: prefixType(type, model) });
      }
      return { ...sagaEffects, put };
    }

    // hoc for dispatch，修改 dispatch 默认的type 参数，加namespace前缀
    function createDispatch(dispatch, model) {
      return (action) => {
        const { type } = action;
        invariant(type, 'dispatch: action should be a plain Object with type');
        warning(
          type.indexOf(`${model.namespace}${SEP}`) !== 0,
          `dispatch: ${type} should not be prefixed with namespace ${model.namespace}`,
        );
        return dispatch({ ...action, type: prefixType(type, model) });
      };
    }

    function applyOnEffect(fns, effect, model, key) {
      for (const fn of fns) {
        effect = fn(effect, sagaEffects, model, key);
      }
      return effect;
    }
  };
}
