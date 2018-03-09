<template>
  <div id="main">
    <div id="list">
      <list></list>
    </div>
    <div id="detail">
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
  position: fixed!important;
  position: absolute;
  height: 100%;
  width: 30%;
  border-right: solid 1px;
  top: 0;
  left: 0;
  overflow: auto;
}
#detail {
  height: 100%;
  width: 70%;
  overflow: auto;
  float: right;
}
</style>
