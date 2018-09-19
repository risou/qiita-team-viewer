<template>
  <div class="detail" @click="clearPalettes">
    <article class="item" v-if="Object.keys(article).length">
      <div class="media">
        <div class="media-left image is-64x64">
          <a><img :title="article.user.id" :src="article.user.profile_image_url" class="author_icon"></a>
        </div>
        <div class="media-content">
          <div class="level is-marginless">
            <div class="level-left">
              <a :href="userUrl" target="_blank">{{ team }}/@{{ article.user.id }}</a>
            </div>
            <div class="level-right">
              {{ article.absolute_updated }}
            </div>
          </div>
          <h1 class="title">{{ article.title }}</h1>
          <div class="tags">
            <span class="tag is-link" v-for="tag in article.tags" @click="searchByTag({tag: tag.name})">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
      <hr/>
      <div class="content" v-html="html">
      </div>
      <div class="reaction_panel">
        <div class="reaction_palette">
          <div class="reaction_panel_slide" :class="{ open: isPaletteOpen }">
            <a class="reaction_panel_icon" :class="{ active: isReactioned['+1'] }" @click="toggleReaction({ reaction: '+1' })">
              <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f44d.png" alt="+1" />
            </a>
            <a class="reaction_panel_icon" :class="{ active: isReactioned['pray'] }" @click="toggleReaction({ reaction: 'pray' })">
              <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f64f.png" alt="pray" />
            </a>
            <a class="reaction_panel_icon" :class="{ active: isReactioned['tada'] }" @click="toggleReaction({ reaction: 'tada' })">
              <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f389.png" alt="tada" />
            </a>
            <a class="reaction_panel_icon" :class="{ active: isReactioned['bow'] }" @click="toggleReaction({ reaction: 'bow' })">
              <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f647.png" alt="bow" />
            </a>
            <a class="reaction_panel_icon" :class="{ active: isReactioned['scream'] }" @click="toggleReaction({ reaction: 'scream' })">
              <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f631.png" alt="scream" />
            </a>
            <a class="reaction_panel_icon" :class="{ active: isReactioned['eyes'] }" @click="toggleReaction({ reaction: 'eyes' })">
              <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f440.png" alt="eyes" />
            </a>
          </div>
          <a class="reaction_palette_button" @click="togglePalette">
            <i class="fa fa-fw" :class="{ 'fa-caret-right': !isPaletteOpen, 'fa-caret-left': isPaletteOpen }"></i>
          </a>
        </div>
        <div class="reaction_contents">
          <div class="reaction_contents_block" v-for="reaction in reactions">
            <img class="reaction_contents_user" :src="reaction.user.profile_image_url" :alt="reaction.user.id" :title="reaction.user.id">
            <br>
            <img class="reaction_contents_icon" :src="reaction.image_url" :alt="reaction.name">
          </div>
        </div>
      </div>
      <div class="box" v-for="comment in comments">
        <div class="media">
          <div class="media-left">
            <img :src="comment.user.profile_image_url" width="40" height="40" class="commenter_icon">
          </div>
          <div class="media-content">
            <div class="level">
              <div class="level-left">
                <a :href="'https://' + team + '.qiita.com/' + comment.user.id">@{{ comment.user.id }}</a>
              </div>
              <div class="level-right">
                {{ comment.absolute_created }}
              </div>
            </div>
            <div class="content" v-html="comment.html"></div>
            <div class="reaction_panel">
              <div class="reaction_palette">
                <div class="reaction_panel_slide" :class="{ open: comment.isPaletteOpen }">
                  <a class="reaction_panel_icon" :class="{ active: comment.isReactioned['+1'] }" @click="toggleCommentReaction({ id: comment.id, reaction: '+1' })">
                    <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f44d.png" alt="+1" />
                  </a>
                  <a class="reaction_panel_icon" :class="{ active: comment.isReactioned['pray'] }" @click="toggleCommentReaction({ id: comment.id, reaction: 'pray' })">
                    <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f64f.png" alt="pray" />
                  </a>
                  <a class="reaction_panel_icon":class="{ active: comment.isReactioned['tada'] }" @click="toggleCommentReaction({ id: comment.id, reaction: 'tada' })">
                    <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f389.png" alt="tada" />
                  </a>
                  <a class="reaction_panel_icon":class="{ active: comment.isReactioned['bow'] }" @click="toggleCommentReaction({ id: comment.id, reaction: 'bow' })">
                    <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f647.png" alt="bow" />
                  </a>
                  <a class="reaction_panel_icon":class="{ active: comment.isReactioned['scream'] }" @click="toggleCommentReaction({ id: comment.id, reaction: 'scream' })">
                    <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f631.png" alt="scream" />
                  </a>
                  <a class="reaction_panel_icon":class="{ active: comment.isReactioned['eyes'] }" @click="toggleCommentReaction({ id: comment.id, reaction: 'eyes' })">
                    <img src="https://cdn.qiita.com/emoji/twemoji/unicode/1f440.png" alt="eyes" />
                  </a>
                </div>
                <a class="reaction_palette_button" @click="toggleCommentPalette(comment.id)">
                  <i class="fa fa-fw" :class="{ 'fa-caret-right': !comment.isPaletteOpen, 'fa-caret-left': comment.isPaletteOpen }"></i>
                </a>
              </div>
              <div class="reaction_contents">
                <div class="reaction_contents_block" v-for="reaction in comment.reactions">
                  <img class="reaction_contents_user" :src="reaction.user.profile_image_url" :alt="reaction.user.id" :title="reaction.user.id">
                  <br>
                  <img class="reaction_contents_icon" :src="reaction.image_url" :alt="reaction.name">
                </div>
              </div>
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
  name: 'detail-view',
  computed: {
    ...mapState({
      article: state => state.detail.article,
      team: state => state.detail.team,
      html: state => state.detail.html,
      reactions: state => state.detail.reactions,
      comments: state => state.detail.comments,
      isPaletteOpen: state => state.detail.isPaletteOpen,
      isReactioned: state => state.detail.isReactioned
    }),
    userUrl () {
      return 'https://' + this.$store.state.detail.team + '.qiita.com/' + this.$store.state.detail.article.user.id
    }
  },
  methods: {
    ...mapActions([
      'toggleReaction',
      'toggleCommentReaction',
      'searchByTag'
    ]),
    togglePalette: function (event) {
      this.$store.commit('togglePalette')
    },
    toggleCommentPalette: function (commentId) {
      this.$store.commit('toggleCommentPalette', { commentId: commentId })
    },
    clearPalettes: function (event) {
      if (!event.target.closest('.reaction_palette')) {
        this.$store.commit('clearPalettes')
      }
    }
  }
}
</script>

<style lang="scss">
#detail .media {
  padding-top: 20px;
}
.tag.is-link {
  cursor: pointer;
}
.reaction_panel {
  display: flex;
  padding-bottom: 18px;
  position: relative;
  width: 100%;
}
.reaction_palette {
  display: flex;
  position: absolute;
  z-index: 1;
  background-color: #fff;
}
.reaction_panel_slide {
  font-size: 14px;
  border: 1px solid #ddd;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
  height: 36px;
  max-width: 47px;
  overflow: hidden;
}
.reaction_panel_slide.open {
  display: flex;
  max-width: 300px;
  flex-flow: row wrap;
  justify-content: flex-start;
}
.reaction_panel_icon {
  width: 41px;
  height: 36px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reaction_panel_icon:hover>img {
  transform: scale(1.3);
}
.reaction_panel_icon.active:before {
  display: block;
  content: '';
  position: absolute;
  width: 42px;
  height: 42px;
  background-color: #d7edff;
  z-index: -1;
  left: 0;
  top: 0;
}
.reaction_panel_icon>img {
  width: 23px;
  height: 23px;
    -webkit-transition: all 0.2s;
  transition: all 0.2s;
}
.reaction_palette_button {
  display: inline-block;
  color: #555;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  border: 1px solid #ddd;
  border-left-style: none;
  padding: 6px 2px;
  font-size: 16px;
  height: 36px;
}
.reaction_palette_button:hover {
  background: #458ac5;
  border-color: #458ac5;
  color: #fff;
  cursor: pointer;
  text-decoration: none;
}
.reaction_contents {
  flex-glow: 1;
  margin-left: 73px;
  min-height: 40px;
}
.reaction_contents_block {
  display: inline-block;
  position: relative;
  margin-left: 10px;
  margin-bottom: 10px;
}
img {
  border-style: none;
  vertical-align: middle;
}
.reaction_contents_user {
  height: 30px;
  width: 30px;
  border-radius: 3px;
}
.reaction_contents_icon {
  height: 22px;
  width: 22px;
  padding: 0;
  position: absolute;
  right: -7px;
  bottom: -7px;
}
.author_icon {
  border-radius: 6px;
}
.commenter_icon {
  border-radius: 4px;
}

.content {
  .fa.fa-link {
    display: none;
  }
  h1 {
    border-bottom: solid 3px #eee;
    font-size: 1.7em;
    padding-bottom: .3em;
  }
  h2 {
    border-bottom: solid 1px #eee;
    font-size: 1.6em;
    padding-bottom: .3em;
  }
  h3 {
    font-size: 1.3em;
  }
  h4 {
    font-size: 1.2em;
  }
  h5 {
    font-size: 1.1em;
  }
  h6 {
    font-size: 1em;
    color: #777;
  }
  .code-lang {
    display: inline-block;
    padding: .1em .5em;
    background-color: rgba(0, 0, 0, .07);
  }
}
</style>
