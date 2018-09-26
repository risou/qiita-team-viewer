import Vue from 'vue'
import Vuex from 'vuex'
import shortkey from 'vue-shortkey'

import modules from './modules'
import * as actions from './actions'
import * as mutations from './mutations'
import state from './state'

Vue.use(Vuex)
Vue.use(shortkey)

export default new Vuex.Store({
  state,
  mutations,
  actions,
  modules,
  strict: process.env.NODE_ENV !== 'production'
})
