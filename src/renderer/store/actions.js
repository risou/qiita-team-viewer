import Qiita from 'qiita-js'
import request from 'request'
import async from 'async'
import storage from 'electron-json-storage-sync'
import axios from 'axios'
import cheerio from 'cheerio'
import moment from 'moment'

let token

function setUser (context, team) {
  Qiita.setEndpoint('https://' + team + '.qiita.com')
  Qiita.Resources.AuthenticatedUser.get_authenticated_user().then((user) => {
    context.commit('setUser', { user: user })
  })
}

function setToken () {
  if (!token) {
    const authStorage = storage.get('auth')
    if (authStorage.status) {
      token = authStorage.data.token
    } else {
      throw authStorage.error
    }
  }
  Qiita.setToken(token)
  const authHeader = 'Bearer ' + token
  axios.defaults.headers.common['Authorization'] = authHeader
}

function overwriteImgSrc (imageUrl) {
  let result = imageUrl
  axios({
    method: 'get',
    url: imageUrl,
    responseType: 'arraybuffer'
  }).then((resp) => {
    const mimeType = resp.headers['content-type'].toLowerCase()
    const imgBase64 = Buffer.from(resp.data, 'binary').toString('base64')
    result = 'data:' + mimeType + ';base64,' + imgBase64
  })
  return result
}

function calcRelativeTime (absoluteTime) {
  const diff = moment() - moment(absoluteTime)
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分前'
  } else if (diff < 86400000) {
    return '約' + Math.floor(diff / 3600000) + '時間前'
  } else {
    return Math.floor(diff / 86400000) + '日前'
  }
}

function getArticle (context, args) {
  Qiita.setEndpoint('https://' + args.team + '.qiita.com')
  Qiita.Resources.Item.get_item(args.id).then((result) => {
    // set selected
    context.commit('setSelected', { id: args.id })
    // set team
    context.commit('setDetailTeam', { team: args.team })
    // get commetns async
    getComments(context, { team: args.team, id: args.id })
    // process img src for SSL
    let body = cheerio.load(result.rendered_body)
    body('body').find('img').each((i, elem) => {
      const src = body(elem).attr('src')
      const processedSrc = overwriteImgSrc(src)
      body(elem).attr('src', processedSrc)
    })
    // process link use external browser
    body('body').find('a').each((i, elem) => {
      const href = body(elem).attr('href')
      if (href) {
        if (href.match(/^\//)) {
          const url = 'https://' + args.team + '.qiita.com' + href
          body(elem).attr('href', url)
          body(elem).attr('target', '_blank')
        } else if (href.match(/^#/)) {
        } else {
          body(elem).attr('target', '_blank')
        }
      }
    })
    // set absolute time of updated_at
    result.absolute_updated = moment(result.updated_at).format('YYYY/MM/DD HH:mm:ss')

    context.commit('setArticle', { article: result })
    context.commit('setHtml', { html: body.html() })
    window.scrollTo(0, 0)
  })
}

function getReactions (context, args) {
  request.get({
    url: 'https://' + args.team + '.qiita.com/api/v2/items/' + args.id + '/reactions',
    json: true,
    auth: {
      'bearer': token
    }
  }, (error, response, body) => {
    if (error) throw error
    let userReaction = []
    for (let i = 0; i < body.length; i++) {
      if (body[i].user.id === context.state.user.id) {
        userReaction.push(body[i].name)
      }
    }
    context.commit('setReactions', { reactions: body.reverse() })
    context.commit('setUserReaction', { reactionList: userReaction })
  })
}

function getComments (context, args) {
  Qiita.Resources.Comment.list_item_comments(args.id).then((result) => {
    for (let index = result.length - 1; index >= 0; index--) {
      // process img src for SSL
      let body = cheerio.load(result[index].rendered_body)
      body('body').find('img').each((i, elem) => {
        const src = body(elem).attr('src')
        const processedSrc = overwriteImgSrc(src)
        body(elem).attr('src', processedSrc)
      })
      // process link use external browser
      body('body').find('a').each((i, elem) => {
        const href = body(elem).attr('href')
        if (href.match(/^\//)) {
          const url = 'https://' + args.team + '.qiita.com' + href
          body(elem).attr('href', url)
          body(elem).attr('target', '_blank')
        } else if (href.match(/^#/)) {
        } else {
          body(elem).attr('target', '_blank')
        }
      })
      result[index].html = body.html()
      // set absolute time of created_at
      result[index].absolute_created = moment(result[index].created_at).format('YYYY/MM/DD HH:mm:ss')
    }
    async.each(result, (comment, next) => {
      getCommentReactions(context, { team: args.team, commentId: comment.id }, (reactions, userReaction) => {
        comment.reactions = reactions
        let isReactioned = {}
        for (let i = 0; i < userReaction.length; i++) {
          isReactioned[userReaction[i]] = true
        }
        comment.isReactioned = isReactioned
        next(null)
      })
    }, (error) => {
      if (error) throw error
      context.commit('setComments', { comments: result.reverse() })
    })
  })
}

function getCommentReactions (context, args, callback) {
  request.get({
    url: 'https://' + args.team + '.qiita.com/api/v2/comments/' + args.commentId + '/reactions',
    json: true,
    auth: {
      'bearer': token
    }
  }, (error, response, body) => {
    if (error) throw error
    let userReaction = []
    for (let i = 0; i < body.length; i++) {
      if (body[i].user.id === context.state.user.id) {
        userReaction.push(body[i].name)
      }
    }
    callback(body.reverse(), userReaction)
  })
}

export const getTeams = async (context) => {
  setToken()
  let teams = []
  Qiita.setEndpoint('https://qiita.com')
  await Qiita.Resources.Team.list_teams()
    .then((listTeams) => {
      for (let i = 0; i < listTeams.length; i++) {
        teams.push(listTeams[i].id)
      }
      context.commit('setTeam', { teams: teams })
      setUser(context, listTeams[0].id)
    })
}

export const getArticles = (context) => {
  let articles = []
  const teams = context.state.team
  async.each(teams, (team, next) => {
    Qiita.setEndpoint('https://' + team + '.qiita.com')
    Qiita.Resources.Item.list_items({
      page: 1,
      per_page: 20
    }).then((list) => {
      for (let i = 0; i < list.length; i++) {
        list[i].team = team
        articles.push(list[i])
      }
      next(null)
    })
  }, (error) => {
    if (error) throw error
    let sortedArticles = articles.sort((a, b) => {
      if (a.created_at < b.created_at) return 1
      if (a.created_at > b.created_at) return -1
      return 0
    })
    for (let i = 0; i < sortedArticles.length; i++) {
      sortedArticles[i].relative_time = calcRelativeTime(sortedArticles[i].created_at)
      sortedArticles[i].absolute_time = moment(sortedArticles[i].created_at).format('YYYY/MM/DD HH:mm:ss')
    }
    context.commit('setArticles', { articles: sortedArticles })
  })
}

export const selectArticle = (context, payload) => {
  context.commit('clearPalette')

  getArticle(context, { team: payload.article.team, id: payload.article.id })

  getReactions(context, { team: payload.article.team, id: payload.article.id })
}

export const nextArticle = (context, payload) => {
  const current = context.state.selected
  const list = context.state.articles
  let next
  if (!current && list.length > 0) {
    next = list[0]
  } else {
    for (let i = 0; i < list.length - 1; i++) {
      if (current !== list[i].id) {
        continue
      }
      next = list[i + 1]
    }
  }

  if (next) {
    context.commit('clearPalette')

    getArticle(context, { team: next.team, id: next.id })

    getReactions(context, { team: next.team, id: next.id })
  }
}

export const prevArticle = (context, payload) => {
  const current = context.state.selected
  const list = context.state.articles
  let prev
  if (!current && list.length > 0) {
    prev = list[0]
  } else {
    for (let i = 1; i < list.length; i++) {
      if (current !== list[i].id) {
        continue
      }
      prev = list[i - 1]
    }
  }

  if (prev) {
    context.commit('clearPalette')

    getArticle(context, { team: prev.team, id: prev.id })

    getReactions(context, { team: prev.team, id: prev.id })
  }
}

export const toggleReaction = (context, payload) => {
  const reaction = payload.reaction
  const detail = context.state.detail
  const current = detail.isReactioned[reaction]
  if (current) { // true -> false : DELETE
    request.delete({
      url: 'https://' + detail.team + '.qiita.com/api/v2/items/' + detail.article.id + '/reactions/' + reaction,
      json: true,
      auth: {
        'bearer': token
      }
    }, (error, response, body) => {
      if (error) throw error
      context.commit('deleteReaction', { name: reaction })
    })
  } else { // false -> true : POST
    request.post({
      url: 'https://' + detail.team + '.qiita.com/api/v2/items/' + detail.article.id + '/reactions',
      json: {
        name: reaction
      },
      auth: {
        'bearer': token
      }
    }, (error, response, body) => {
      if (error) throw error
      context.commit('addReaction', { name: reaction, body: body })
    })
  }
}

export const toggleCommentReaction = (context, payload) => {
  const reaction = payload.reaction
  let comment
  for (let i = 0; i < context.state.detail.comments.length; i++) {
    if (context.state.detail.comments[i].id === payload.id) {
      comment = context.state.detail.comments[i]
    }
  }
  const current = reaction in comment.isReactioned ? comment.isReactioned[reaction] : false
  if (current) { // true -> false : DELETE
    request.delete({
      url: 'https://' + context.state.detail.team + '.qiita.com/api/v2/comments/' + payload.id + '/reactions/' + reaction,
      json: true,
      auth: {
        'bearer': token
      }
    }, (error, response, body) => {
      if (error) throw error
      context.commit('deleteCommentReaction', { id: payload.id, name: reaction })
    })
  } else { // false -> true : POST
    request.post({
      url: 'https://' + context.state.detail.team + '.qiita.com/api/v2/comments/' + payload.id + '/reactions',
      json: {
        name: reaction
      },
      auth: {
        'bearer': token
      }
    }, (error, response, body) => {
      if (error) throw error
      context.commit('addCommentReaction', { id: payload.id, name: reaction, body: body })
    })
  }
}
