export const setTeam = (state, payload) => {
  state.team = payload.teams
}

export const setArticles = (state, payload) => {
  state.articles = payload.articles
}

export const setArticle = (state, payload) => {
  state.detail.article = payload.article
}
