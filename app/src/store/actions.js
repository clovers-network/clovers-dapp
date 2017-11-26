// var Socket = require('simple-websocket')
// var socket = new Socket('ws://localhost:3333')
// socket.on('connect', () => {
//   console.log('connected')
//   // socket is connected!
//   socket.send('sup!')
// })

const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:3333')

ws.on('open', function open () {
  console.log('open')
  ws.send('something')
})

ws.on('message', function incoming (data) {
  console.log(data)
})

export default {
  setUpSocket ({commit, dispatch}) {
    // socket.on('data', (data) => {
    //   console.log('data ')
    //   console.log(JSON.parse(data))
    //   data = JSON.parse(data)
    //   if (data.type === 'init') {
    //     console.log('hier!')
    //     commit('UPDATE_ALLCLOVERS', data.clovers)
    //     commit('UPDATE_LOGS', data.logs)
    //     commit('UPDATE_USERS', data.users)
    //   } else {
    //     console.log('update data')
    //   }
    // })
  },
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
  },
  cloverExists ({commit, getters}, byteBoard) {
    return getters.allClovers.findIndex((c) => c.board === byteBoard) > -1
  }
}
