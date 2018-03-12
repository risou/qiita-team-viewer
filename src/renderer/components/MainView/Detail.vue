<template>
  <div class="detail">
    <article class="item" v-if="Object.keys(article).length">
      <header class="item_header">
        <div class="item_header_body">
          <div class="item_header_icon">
            <a><img class="user_icon" :title="article.user.id" src="" width="36" height="36"></a>
          </div>
        </div>
        <div class="item_header_title">
          <h1 class="item_title">{{ article.title }}</h1>
        </div>
      </header>
      <div class="item_body" v-html="html">
      </div>
    </article>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'detail-view',
  computed: {
    ...mapState({
      article: state => state.detail.article,
      html: state => state.detail.html
    })
  }
}
</script>

<style>
</style>
