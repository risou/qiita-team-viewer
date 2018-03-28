<template>
  <div class="list">
    <article v-for="article in articles" class="box is-marginless is-radiusless" @click="selectArticle({ article: article })" :class="{ active: article.id === selected }">
      <div class="media">
        <div class="media-left">
          <img :src="article.user.profile_image_url" width="40" height="40">
        </div>
        <div class="media-content">
          <div class="level">
            <div class="level-left">
              {{ article.team }}/@{{ article.user.id }}
            </div>
            <div class="level-right" :title="article.absolute_time">
              {{ article.relative_time }}
            </div>
          </div>
          <div class="content">
            <a>{{ article.title }}</a>
            <span class="tag is-info" v-if="article.group">{{ article.group.name }}</span>
          </div>
          <div class="level">
            <div class="level-left">
              <div class="level-item" v-for="tag in article.tags">
                <span class="tag">{{ tag.name }}</span>
              </div>
            </div>
            <div class="level-right">
              <span class="fas fa-comments level-item"> {{ article.comments_count }}</span>
              <span class="far fa-smile level-item"> {{ article.reactions_count }}</span>
            </div>
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
      'articles',
      'selected'
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

<style lang="scss">
.box:hover {
  background-color: #eee;
}
.box a:hover {
  color: #3273dc;
}
.box.active {
  padding: 18px;
  border: 2px solid hsl(204, 86%, 53%);
}
.fa-comments:before {
  margin-right: 0.25em;
  font-weight: 900;
}
.fa-comments {
  font-weight: 400;
}
.fa-smile:before {
  margin-right: 0.25em;
}
</style>
