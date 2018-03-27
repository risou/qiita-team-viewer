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
  import List from './MainView/List'
  import Detail from './MainView/Detail'

  export default {
    name: 'main-view',
    components: {
      List,
      Detail
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
