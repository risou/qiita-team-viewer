import Qiita from 'qiita-js'
import async from 'async'
import storage from 'electron-json-storage-sync'

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
    context.commit('setArticles', { articles: sortedArticles })
  })
}

export const getArticle = (context, payload) => {

}

export const selectArticle = (context, payload) => {
  context.commit('setArticle', { article: payload.article })
}
