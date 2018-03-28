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
      per_page: 10
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

  Qiita.setEndpoint('https://' + payload.article.team + '.qiita.com')
  Qiita.Resources.Item.get_item(payload.article.id).then((result) => {
    // set selected
    context.commit('setSelected', { id: payload.article.id })
    // set team
    context.commit('setDetailTeam', { team: payload.article.team })
    // process img src for SSL
    let body = cheerio.load(result.rendered_body)
    body('body').find('img').each((i, elem) => {
      const src = body(elem).attr('src')
      const processedSrc = overwriteImgSrc(src)
      body(elem).attr('src', processedSrc)
    })
    body('body').find('a').each((i, elem) => {
      const href = body(elem).attr('href')
      if (href.match(/^\//)) {
        const url = 'https://' + payload.article.team + '.qiita.com' + href
        body(elem).attr('href', url)
        body(elem).attr('target', '_blank')
      } else if (href.match(/^#/)) {
      } else {
        body(elem).attr('target', '_blank')
      }
    })
    // set absolute time of updated_at
    result.absolute_updated = moment(result.updated_at).format('YYYY/MM/DD HH:mm:ss')

    context.commit('setArticle', { article: result })
    context.commit('setHtml', { html: body.html() })
    window.scrollTo(0, 0)
  })

  request.get({
    url: 'https://' + payload.article.team + '.qiita.com/api/v2/items/' + payload.article.id + '/reactions',
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

    Qiita.setEndpoint('https://' + next.team + '.qiita.com')
    Qiita.Resources.Item.get_item(next.id).then((result) => {
      // set selected
      context.commit('setSelected', { id: next.id })
      // set team
      context.commit('setDetailTeam', { team: next.team })
      // process img src for SSL
      let body = cheerio.load(result.rendered_body)
      body('body').find('img').each((i, elem) => {
        const src = body(elem).attr('src')
        const processedSrc = overwriteImgSrc(src)
        body(elem).attr('src', processedSrc)
      })
      body('body').find('a').each((i, elem) => {
        const href = body(elem).attr('href')
        if (href.match(/^\//)) {
          const url = 'https://' + next.team + '.qiita.com' + href
          body(elem).attr('href', url)
          body(elem).attr('target', '_blank')
        } else if (href.match(/^#/)) {
        } else {
          body(elem).attr('target', '_blank')
        }
      })
      // set absolute time of updated_at
      result.absolute_updated = moment(result.updated_at).format('YYYY/MM/DD HH:mm:ss')

      context.commit('setArticle', { article: result })
      context.commit('setHtml', { html: body.html() })
      window.scrollTo(0, 0)
    })
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

    Qiita.setEndpoint('https://' + prev.team + '.qiita.com')
    Qiita.Resources.Item.get_item(prev.id).then((result) => {
      // set selected
      context.commit('setSelected', { id: prev.id })
      // set team
      context.commit('setDetailTeam', { team: prev.team })
      // process img src for SSL
      let body = cheerio.load(result.rendered_body)
      body('body').find('img').each((i, elem) => {
        const src = body(elem).attr('src')
        const processedSrc = overwriteImgSrc(src)
        body(elem).attr('src', processedSrc)
      })
      body('body').find('a').each((i, elem) => {
        const href = body(elem).attr('href')
        if (href.match(/^\//)) {
          const url = 'https://' + prev.team + '.qiita.com' + href
          body(elem).attr('href', url)
          body(elem).attr('target', '_blank')
        } else if (href.match(/^#/)) {
        } else {
          body(elem).attr('target', '_blank')
        }
      })
      // set absolute time of updated_at
      result.absolute_updated = moment(result.updated_at).format('YYYY/MM/DD HH:mm:ss')

      context.commit('setArticle', { article: result })
      context.commit('setHtml', { html: body.html() })
      window.scrollTo(0, 0)
    })
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
      context.commit('clearPalette')
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
      context.commit('clearPalette')
    })
  }
}
