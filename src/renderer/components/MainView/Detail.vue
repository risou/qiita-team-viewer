<template>
  <div class="detail">
    <article class="item" v-if="Object.keys(article).length">
      <header class="item_header">
        <div class="item_header_body">
          <div class="item_header_icon">
            <a><img class="user_icon" :title="article.user.id" :src="article.user.profile_image_url" width="36" height="36"></a>
          </div>
          <div class="item_header_notes">
            <div class="item_header_user">
              <a :href="userUrl" target="_blank">{{ article.team }}/@{{ article.user.id }}</a>
            </div>
            <div class="item_header_date">
              {{ article.absolute_updated }}
            </div>
            <ul class="item_header_actions">
            </ul>
          </div>
          <div class="item_header_title">
            <h1 class="item_title">{{ article.title }}</h1>
          </div>
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
    }),
    userUrl () {
      return 'https://' + this.$store.state.detail.article.team + '.qiita.com/' + this.$store.state.detail.article.user.id
    }
  }
}
</script>

<style>
</style>
