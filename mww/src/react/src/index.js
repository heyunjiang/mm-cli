import dva from './dva/index'
import createLoading from './dva/dva-loading'
import appModule from './models/app'
import Router from './router'

// 获取 app 对象
const app = dva({
	reactRouterVersion: '4',
	reactVersion: '16'
})

// 增加 loading 插件
app.use(createLoading())

// 增加 _models
app.model(appModule)

// 增加 _router，添加根路由和首屏路由
app.router(Router)

app.start('#app')
