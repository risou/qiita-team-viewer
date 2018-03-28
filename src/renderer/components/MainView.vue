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
        this.$store.dispatch('getArticles')
      })
      this.$electron.ipcRenderer.on('J', (event, arg) => {
        const current = document.getElementsByClassName('box active')
        if (current.length > 0) {
          const currentElement = current[0]
          const rect = currentElement.getBoundingClientRect()
          if (rect.top < 0 || rect.bottom + 148 > window.innerHeight) {
            currentElement.scrollIntoView(true)
          }
        }
        this.$store.dispatch('nextArticle')
      })
      this.$electron.ipcRenderer.on('K', (event, arg) => {
        const current = document.getElementsByClassName('box active')
        if (current.length > 0) {
          const currentElement = current[0]
          const rect = currentElement.getBoundingClientRect()
          if (rect.top - 148 < 0 || rect.bottom > window.innerHeight) {
            currentElement.scrollIntoView(false)
          }
        }
        this.$store.dispatch('prevArticle')
      })
      this.$electron.ipcRenderer.on('L', (evnet, arg) => {
        const url = this.$store.state.detail.article.url
        if (url) {
          shell.openExternal(url)
        }
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
</style>
