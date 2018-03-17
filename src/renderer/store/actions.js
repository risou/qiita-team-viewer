import Qiita from 'qiita-js'
import async from 'async'
import storage from 'electron-json-storage-sync'
import axios from 'axios'
import cheerio from 'cheerio'
import moment from 'moment'

let token

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

export const getArticle = (context, payload) => {

}

export const selectArticle = (context, payload) => {
  let body = cheerio.load(payload.article.rendered_body)
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
  context.commit('setArticle', { article: payload.article })
  context.commit('setHtml', { html: body.html() })
  window.scrollTo(0, 0)
}
