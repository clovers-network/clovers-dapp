// var Socket = require('simple-websocket')
// var socket = new Socket('ws://localhost:3333')
// socket.on('connect', () => {
//   console.log('connected')
//   // socket is connected!
//   socket.send('sup!')
// })

// const WebSocket = require('ws')

// const ws = new WebSocket('ws://localhost:3333')

// ws.on('open', function open () {
//   console.log('open')
//   ws.send('something')
// })

// ws.on('message', function incoming (data) {
//   console.log(data)
// })

import io from 'socket.io-client'
export default {
  setUpSocket ({commit, dispatch}) {
    console.log('set up socket')
    const socket = io('http://api.clovers.network')

    socket.on('disconnect', () => {
      console.log('disconnected')
    })

    socket.on('init', ({clovers, users, logs}) => {
      console.log('got init')
      commit('UPDATE_ALLCLOVERS', clovers)
      commit('UPDATE_LOGS', logs)
      commit('UPDATE_USERS', users)
    })

    socket.on('newUser', (user) => {
      commit('ADD_USER', user)
      console.log(user)
    })
    socket.on('updateUser', (user) => {
      commit('UPDATE_USER', user)
      console.log(user)
    })
    socket.on('newClover', (clover) => {
      commit('ADD_CLOVER', clover)
      console.log(clover)
    })
    socket.on('updateClover', (clover) => {
      commit('UPDATE_CLOVER', clover)
      console.log(clover)
    })
    socket.on('newUserName', (log) => {
      console.log(log)
      commit('ADD_LOG', log)
    })
    socket.on('newCloverName', (log) => {
      console.log(log)
      commit('ADD_LOG', log)
    })
    socket.on('Registered', (log) => {
      console.log(log)
      commit('ADD_LOG', log)
    })
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
