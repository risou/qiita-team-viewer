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
            <span class="group" v-if="article.group">{{ article.group.name }}</span>
          </h1>
          <div class="list_tags">
            <div class="list_tag" v-for="tag in article.tags">
              <span class="tag_name">{{ tag.name }}</span>
            </div>
          </div>
          <div class="list_stats">
            <i class="fas fa-comments"> {{ article.comments_count }}</i>
            <i class="far fa-smile"> {{ article.reactions_count }}</i>
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
