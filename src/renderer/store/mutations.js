export const setUser = (state, payload) => {
  state.user = payload.user
}

export const setTeam = (state, payload) => {
  state.team = payload.teams
}

export const setArticles = (state, payload) => {
  state.articles = payload.articles
  state.articles.splice(payload.articles.length)
}

export const setArticle = (state, payload) => {
  state.detail.article = payload.article
}

export const setSelected = (state, payload) => {
  state.selected = payload.id
}

export const clearSelected = (state, payload) => {
  state.selected = ''
}

export const setDetailTeam = (state, payload) => {
  state.detail.team = payload.team
}

export const setHtml = (state, payload) => {
  state.detail.html = payload.html
}

export const setReactions = (state, payload) => {
  if (state.detail.reactions) {
    state.detail.reactions = payload.reactions
    state.detail.reactions.splice(payload.reactions.length)
  } else {
    state.detail.reactions = payload.reactions
  }
}

export const addReaction = (state, payload) => {
  state.detail.isReactioned[payload.name] = true
  state.detail.reactions.push(payload.body)
}

export const deleteReaction = (state, payload) => {
  state.detail.isReactioned[payload.name] = false
  let target
  for (let i = 0; i < state.detail.reactions.length; i++) {
    const reaction = state.detail.reactions[i]
    if (reaction.user.id === state.user.id && reaction.name === payload.name) {
      target = i
      break
    }
  }
  if (target) {
    state.detail.reactions.splice(target, 1)
  }
}

export const addCommentReaction = (state, payload) => {
  let comment
  for (let i = 0; i < state.detail.comments.length; i++) {
    if (state.detail.comments[i].id === payload.id) {
      comment = state.detail.comments[i]
    }
  }
  comment.isReactioned[payload.name] = true
  comment.reactions.push(payload.body)
}

export const deleteCommentReaction = (state, payload) => {
  let comment
  for (let i = 0; i < state.detail.comments.length; i++) {
    if (state.detail.comments[i].id === payload.id) {
      comment = state.detail.comments[i]
    }
  }
  comment.isReactioned[payload.name] = false
  let target
  for (let i = 0; i < comment.reactions.length; i++) {
    const reaction = comment.reactions[i]
    if (reaction.user.id === state.user.id && reaction.name === payload.name) {
      target = i
      break
    }
  }
  if (target) {
    comment.reactions.splice(target, 1)
  }
}

export const setUserReaction = (state, payload) => {
  for (let key in state.detail.isReactioned) {
    state.detail.isReactioned[key] = false
  }
  for (let i = 0; i < payload.reactionList.length; i++) {
    const reaction = payload.reactionList[i]
    state.detail.isReactioned[reaction] = true
  }
}

export const togglePalette = (state, payload) => {
  state.detail.isPaletteOpen = !state.detail.isPaletteOpen
}

export const clearPalettes = (state, payload) => {
  state.detail.isPaletteOpen = false
  for (let i = 0; i < state.detail.comments.length; i++) {
    state.detail.comments[i].isPaletteOpen = false
  }
  state.detail.comments.splice(state.detail.comments.length)
}

export const clearPalette = (state, payload) => {
  state.detail.isPaletteOpen = false
}

export const setComments = (state, payload) => {
  state.detail.comments = payload.comments
  state.detail.comments.splice(payload.comments.length)
}

export const toggleCommentPalette = (state, payload) => {
  for (let i = 0; i < state.detail.comments.length; i++) {
    const comment = state.detail.comments[i]
    if (comment.id === payload.commentId) {
      comment.isPaletteOpen = !comment.isPaletteOpen
      state.detail.comments.splice(state.detail.comments.length)
    }
  }
}

export const updateQuery = (state, payload) => {
  state.query = payload.query
}
