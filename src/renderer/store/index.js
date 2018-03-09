import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'
import * as actions from './actions'
import * as mutations from './mutations'
import state from './state'

Vue.use(Vuex)

export default new Vuex.Store({
  state,
  mutations,
  actions,
  modules,
  strict: process.env.NODE_ENV !== 'production'
})
