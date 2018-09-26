<template>
  <div class="list" v-shortkey="{next: ['j'], prev: ['k']}" @shortkey="keyAction">
    <div>
      <form @submit.prevent="searchArticles()" class="tile">
        <input id="search" type="text" v-model.lazy="query" class="tile is-10 input is-small" v-shortkey.avoid></input>
        <button type="submit" class="tile is-2 button is-small">Search</button>
      </form>
    </div>
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
    ]),
    query: {
      get () {
        return this.$store.state.query
      },
      set (value) {
        document.activeElement.blur()
        this.$store.commit('updateQuery', {query: value})
      }
    }
  },
  methods: {
    ...mapActions([
      'selectArticle',
      'searchArticles'
    ]),
    keyAction (event) {
      console.log(event)
      const current = document.getElementsByClassName('box active')
      switch (event.srcKey) {
        case 'next':
          if (current.length > 0) {
            const currentElement = current[0]
            const rect = currentElement.getBoundingClientRect()
            if (rect.top < 0 || rect.bottom + 148 > window.innerHeight) {
              currentElement.scrollIntoView(true)
            }
          } else {
            const articles = document.getElementsByClassName('box')
            const first = articles[0]
            const rect = first.getBoundingClientRect()
            if (rect.top < 0) {
              first.scrollIntoView(true)
            }
          }
          this.$store.dispatch('nextArticle')
          break
        case 'prev':
          if (current.length > 0) {
            const currentElement = current[0]
            const rect = currentElement.getBoundingClientRect()
            if (rect.top - 148 < 0 || rect.bottom > window.innerHeight) {
              currentElement.scrollIntoView(false)
            }
          } else {
            const articles = document.getElementsByClassName('box')
            const first = articles[0]
            const rect = first.getBoundingClientRect()
            if (rect.top < 0) {
              first.scrollIntoView(true)
            }
          }
          this.$store.dispatch('prevArticle')
          break
      }
    }
  },
  created () {
    this.$store.dispatch('getTeams').then(() => {
      this.$store.dispatch('searchArticles')
    })
  }
}
</script>

<style lang="scss">
#list .box:hover {
  background-color: #eee;
}
#list .box a:hover {
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
