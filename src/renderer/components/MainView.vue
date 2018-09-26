<template>
  <div id="main" class="columns is-multiline">
    <div id="list" class="column is-4 is-fullheight">
      <list></list>
    </div>
    <div id="detail" class="column is-8 is-offset-4 is-fullheight">
      <detail></detail>
    </div>
  </div>
</template>

<script>
import { shell } from 'electron'
import List from './MainView/List'
import Detail from './MainView/Detail'

export default {
  name: 'main-view',
  components: {
    List,
    Detail
  },
  mounted () {
    this.$electron.ipcRenderer.on('R', (event, arg) => {
      if (document.activeElement.tagName.toUpperCase() === 'input'.toUpperCase()) {
        return
      }
      this.$store.dispatch('searchArticles')
    })
    this.$electron.ipcRenderer.on('g', (event, arg) => {
      if (document.activeElement.tagName.toUpperCase() === 'input'.toUpperCase()) {
        return
      }
      const list = document.getElementById('list')
      if (list) {
        list.scrollTop = 0
      }
      this.$store.dispatch('firstArticle')
    })
    this.$electron.ipcRenderer.on('Shift+g', (event, arg) => {
      if (document.activeElement.tagName.toUpperCase() === 'input'.toUpperCase()) {
        return
      }
      const list = document.getElementById('list')
      if (list) {
        list.scrollTop = list.scrollHeight
      }
      this.$store.dispatch('lastArticle')
    })
    this.$electron.ipcRenderer.on('L', (event, arg) => {
      if (document.activeElement.tagName.toUpperCase() === 'input'.toUpperCase()) {
        return
      }
      const url = this.$store.state.detail.article.url
      if (url) {
        shell.openExternal(url)
      }
    })
    this.$electron.ipcRenderer.on('CmdOrCtrl+F', (event, arg) => {
      if (document.activeElement.tagName.toUpperCase() === 'input'.toUpperCase()) {
        return
      }
      document.getElementById('search').focus()
    })
  }
}
</script>

<style>
#list {
  position: fixed;
  height: 100%;
  overflow: auto;
}
#detail {
  position: relative;
  left: -12px;
}
::-webkit-scrollbar {
  display: none;
}
</style>
