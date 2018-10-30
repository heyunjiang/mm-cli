import Vue from 'vue'
import Download from './wechat/download.vue'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Download },
  template: '<Download />'
})
