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

// import {Clovers} from 'clovers-contracts'

import io from "socket.io-client";
let polling = null;
import Clover from "../assets/clovers";
global.clover = new Clover();
export default {
  initWeb3({ commit, dispatch }) {
    console.log("INIT-1");
    return clover.initWeb3().then((network, readOnly) => {
      console.log("INIT-2");
      console.log("network", network);
      commit("UPDATE_NETWORK_ID", network);
      console.log("readOnly", readOnly);
      commit("UPDATE_READONLY", readOnly);
      dispatch("startWeb3Polling");
    });
  },
  startWeb3Polling({ dispatch }) {
    polling =
      polling ||
      setInterval(() => {
        dispatch("checkAccount");
      }, 1000);
  },
  stopWeb3Polling() {
    clearInterval(polling);
  },
  checkAccount({ commit, state }) {
    if (state.readOnly) return;
    clover
      .getAccounts()
      .then(accounts => {
        if (accounts.length && state.account !== accounts[0]) {
          commit("UPDATE_ACCOUNT", accounts[0]);
          state.account &&
            clover
              .clubTokenBalanceOf(state.account)
              .then(balance => {
                if (balance !== state.balance) {
                  commit("UPDATE_BALANCE", balance);
                }
              })
              .catch(err => console.log(err));
        } else if (state.account && !accounts.length) {
          commit("UPDATE_ACCOUNT", null);
        }
      })
      .catch(error => {
        console.error(error);
      });
  },
  checkBlock({ commit }) {
    clover
      .currentBlock()
      .then(block => {
        commit("UPDATE_CURRENT_BLOCK", block.number);
      })
      .catch(error => {
        console.error(error);
      });
  },
  setUpSocket({ commit }) {
    console.log("set up socket");
    const socket = io("//api.clovers.network");
    // const socket = io('//localhost:3333')

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.on("init", ({ clovers, users, logs }) => {
      console.log("got init");
      commit("UPDATE_ALLCLOVERS", clovers);
      commit("UPDATE_LOGS", logs);
      commit("UPDATE_USERS", users);
    });

    socket.on("newUser", user => {
      commit("ADD_USER", user);
      console.log(user);
    });
    socket.on("updateUser", user => {
      commit("UPDATE_USER", user);
      console.log(user);
    });
    socket.on("newClover", clover => {
      commit("ADD_CLOVER", clover);
      console.log(clover);
    });
    socket.on("updateClover", clover => {
      commit("UPDATE_CLOVER", clover);
      console.log(clover);
    });
    socket.on("newUserName", log => {
      console.log(log);
      commit("ADD_LOG", log);
    });
    socket.on("newCloverName", log => {
      console.log(log);
      commit("ADD_LOG", log);
    });
    socket.on("Registered", log => {
      console.log(log);
      commit("ADD_LOG", log);
    });
  },
  selfDestructMsg({ commit }, msg) {
    let msgId = commit("ADD_MSG", msg);
    setTimeout(() => {
      commit("REMOVE_MSG", msgId);
    }, 7000);
  },
  addMessage({ commit }, msg) {
    let msgId = Date.now();
    msg.id = msgId;
    commit("ADD_MSG", msg);
    return msg.id;
  },
  cloverExists({ state }, byteBoard) {
    console.log(byteBoard);
    return state.allClovers.findIndex(c => c.board === byteBoard) > -1;
  }
};
