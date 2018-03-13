<template>
  <div class="list">
    <article v-for="article in articles">
      <div class="icon">
        <img :src="article.user.profile_image_url" width="40" height="40">
      </div>
      <div class="list_body">
        <div class="list_header">
          <div class="list_user">
            {{ article.team }}/@{{ article.user.id }}
          </div>
          <div class="list_datetime" :title="article.absolute_time">{{ article.relative_time }}</div>
        </div>
        <div class="list_main">
          <h1 class="list_title">
            <a @click="selectArticle({ article: article })">{{ article.title }}</a>
          </h1>
          <div class="list_tags">
            <div class="list_tag">
              <a href="/tags"></a>
            </div>
          </div>
          <div class="list_stats">
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'list-view',
  computed: {
    ...mapState([
      'articles'
    ])
  },
  methods: {
    ...mapActions([
      'selectArticle'
    ])
  },
  created () {
    this.$store.dispatch('getTeams').then(() => {
      this.$store.dispatch('getArticles')
    })
  }
}
</script>

<style>
</style>
