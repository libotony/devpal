import DB from './database'
import './window.init'
import Vue from 'vue'
import Buefy from 'buefy'
import VeeValidate from 'vee-validate'
import './validator'
import './custom.scss'
import '@fortawesome/fontawesome-free/css/all.css'
import App from './App.vue'
import './filters'
import './directives'
import router from './Router'
import './overwrite.css'
import VueAnalytics from 'vue-analytics'
import Connex from '@vechain/connex'
declare module 'vue/types/vue' {
  interface Vue {
    $connex: Connex
    $explorerAccount: string
    $explorerBlock: string
    $explorerTx: string
  }
}

Vue.use(Buefy, {
  defaultIconPack: 'fas'
})

Vue.use(VeeValidate, {
  events: 'blur',
  validity: true
})

Vue.use(VueAnalytics, {
  id: 'UA-132391998-2',
  disabled: process.env.NODE_ENV === 'production'
})

Vue.config.productionTip = false

Vue.prototype.$connex = new Connex({ node: (window as any).nodeUrl, network: (window as any).genesis })
Vue.prototype.$explorerAccount = `${(window as any).insight}/#/accounts/`
Vue.prototype.$explorerBlock = `${(window as any).insight}/#/blocks/`
Vue.prototype.$explorerTx = `${(window as any).insight}/#/txs/`

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
