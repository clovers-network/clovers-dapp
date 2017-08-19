<template>
  <div class="clover-token">
    <header>
      <h1>CloverToken</h1>
      <h3>You have <span class="black"><span id="balance" :class="{green: balance !== '0', red: balance === '0'}">{{ balance }}</span> ♧;</span></h3>
    </header>

    <section>
      <h1>Register CloverToken</h1>
      <form @submit.prevent="sendHandler">
        <input type='text' v-model='newBoard' placeholder='board'>
        <p id="status">{{ bin2hex(boardConverted(newBoard)) }}</p>
        <button id="send" type="submit">Submit</button>
      </form>
    </section>
    <br>
    <button @click.prevent='tryFunction()'>throwawayFunction()</button>
    <div v-html='status'></div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import * as types from '../store/mutation-types'
export default {
  name: 'CloverToken',
  data () {
    return {
      newBoard: 'bbbbbbbbbbbbbbbbwbbwbwbbbbwwwwbbbbbbbbbbwbwwbwbwwwbbbbwwwwwwwwww'
    }
  },
  computed: {
    ...mapGetters({
      address: 'address',
      amount: 'amount',
      balance: 'balance',
      status: 'status'
    })
  },
  methods: {
    bin2hex (val) {
      if (!val) return
      var foo = new this.$BN(val, 2)
      return '0x' + foo.toString(16)
    },
    hex2bin (val) {
      if (!val) return
      var foo = new this.$BN(val, 16)
      return '0b' + foo.toString(2)
    },
    tryFunction () {
      this.$store.dispatch('tryFunction', [1, 2, 3, 4])
    },
    boardConverted (board) {
      return board && '0b' + (board.match(/.{1,1}/g).map((spot) => {
        return spot === 'b' ? '11' : (spot === 'w' ? '10' : '00')
      }).join(''))
    },
    sendHandler () {
      this.$store.dispatch('registerGame', this.bin2hex(this.boardConverted(this.newBoard)))
      // if (isNaN(this.amount) || this.amount === '0' || this.amount === '') {
      //   alert('inavlid amount: ' + this.amount)
      //   return
      // }
      // if (this.address === '') {
      //   alert('invalid address: ' + this.address)
      //   return
      // }
      // this.$store.dispatch('sendToken')
    },
    updateAddress (e) {
      this.$store.commit(types.UPDATE_ADDRESS, e.target.value)
    },
    updateAmount (e) {
      this.$store.commit(types.UPDATE_AMOUNT, e.target.value)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
section, footer {
  margin-top: 3em;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.25em;
}

input {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  width: 100%;
  padding: 0.5em;
  font-size: 1em;
  border: 1px solid #ccc;
  margin-bottom: 1em;
}

button {
  padding: 0.5em 1em;
  background-color: #7FC76A;
  font-size: 1em;
  color: white;
  cursor: pointer;
  border: 0;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

#balance.green {
  color: #7FC76A;
}
#balance.red {
  color: #F62A00;
}
</style>
