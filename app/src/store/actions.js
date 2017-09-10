
export default {
  selfDestructMsg ({ commit }, msg) {
    let msgId = commit('ADD_MSG', msg)
    setTimeout(() => {
      commit('REMOVE_MSG', msgId)
    }, 7000)
  },
  addMessage ({ commit }, msg) {
    let msgId = Date.now()
    msg.id = msgId
    commit('ADD_MSG', msg)
    return msg.id
  }
}
