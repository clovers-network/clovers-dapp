<template>
<div>
<div>: )</div>
<button @click='connect'>Click</button>
<pre>{{board}}</pre>
<pre>{{hex(board)}}</pre>
<pre>{{boardConverted}}</pre>
<pre>{{hex(boardConverted)}}</pre>
<hr>
<pre>{{moves}}</pre>
<pre>{{hex(moves)}}</pre>
<pre>{{movesConverted}}</pre>
<hr>
</div>
</template>

<script>
/* global web3:true */

export default {

  name: 'Punks',

  data () {
    return {
      address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
      abi: require('../assets/punks.js'),
      board: 'bbbbbbbbbbbbbbbbwbbwbwbbbbwwwwbbbbbbbbbbwbwwbwbwwwbbbbwwwwwwwwww',
      moves: 'E6D6C6D7C7B7D8F7A7E3B6A8F5C8E2F3G4A6G8G5C4H3B8C5A5F6E7D3H5H4G6B3C2E8H2D1A2F4B1C3G3C1B5G2G1F8B2D2G7A3B4E1F1A1F2H8H7H6A4H1'
    }
  },
  methods: {
    connect () {
      var newContract = web3.eth.contract(this.abi)
      var contractInstance = newContract.at(this.address)

      contractInstance.symbol.call(function (a, b) {
        console.log(b)
      })
    },
    sha (foo) {
      return web3.sha3(foo)
    },
    hex (foo) {
      return web3.toHex(foo)
    },
    hex2bin (hex) {
      return ('00000000' + (parseInt(hex, 16)).toString(2)).substr(-8)
    }
  },
  computed: {
    boardConverted () {
      return '0b' + (this.board.match(/.{1,1}/g).map((spot) => {
        return spot === 'b' ? '11' : (spot === 'w' ? '10' : '00')
      }).join(''))
    },
    movesConverted () {
      return '0x' + (this.moves.match(/.{1,1}/g).map((hex) => {
        if (!isNaN(hex) && parseInt(hex) < 9) {
          return parseInt(hex) - 1
        } else {
          switch (hex.toUpperCase()) {
            case ('A'):
              return '8'
            case ('B'):
              return '9'
            case ('C'):
              return 'a'
            case ('D'):
              return 'b'
            case ('E'):
              return 'c'
            case ('F'):
              return 'd'
            case ('G'):
              return 'e'
            case ('H'):
              return 'f'
          }
        }
        // return hex + '-' + web3.toHex(hex)
      }).join(''))
    }
  }
}
</script>

<style lang='css' scoped>
</style>
