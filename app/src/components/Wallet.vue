<template>
  <div class="clover-token">
    <header>
      <h1>{{tokenName}}</h1>
      <h3>You have <span class="black"><span id="balance" :class="{green: balance !== '0', red: balance === '0'}">{{ balance }}</span> {{tokenSymbol}};</span></h3>
    </header>

    <section>
      <h1>Register {{tokenName}}</h1>
      <form @submit.prevent="sendHandler">
        <input type='text' v-model='moves' placeholder='board'>
        <button id="send" type="submit">Submit</button>
      </form>
    </section>
    <br>
    col: <input v-model='col'>
    row: <input v-model='row'>
    <button @click.prevent='tryFunction()'>throwawayFunction()</button>
    <form @submit.prevent='helloWorld'>
      <input v-model='newName'>
    </form>
    <div v-html='status'></div>
    <div>{{newBoard}}</div>
    <div>{{convertBoard(newBoard)}}</div>
    <div> {{moveConverted}}</div>
    <div> {{moveUnConverted}}</div>
  </div>
</template>

<script>
import Clover from '../assets/clovers'
var clover = new Clover()
import { mapGetters } from 'vuex'
import * as types from '../store/mutation-types'
export default {
  name: 'Wallet',
  data () {
    return {
      // moves: 'D3E3F6C6F2C4D6E2D2G1G2C1F5C5B3G5E6E7F7E1E8C2D1F8B5A5D7A2B4A4C3C7C8B6F4B2G4H4G6D8F3B8B1H2H6H5H3G7A3G3G8A1H7H8H1F1A6B7A7A8', // basic game
      // moves: 'F5F4D3C4F3E6C3G4F6D2H5B3B4H3B2A3E1F2E2H4D6E3H2B5G1G7G3B1A2A1F7E7E8F1G2D7A6B6G6D1H7H6G5F8C1H1A5A4C6C2D8H8C5B7G8C8A7C7B8A8', // x = y
      // moves: 'F5D6C3F3D3D2C4B5E3E2B4F4G3F2C5E6G4G5C7H4H3H5D1H2E7C1F1C2E1G1H6H7A6F6G6A4A3A2B3F7D7E8D8C8G7H8G8F8C6B8A5A7B1A1B2B6G2H1', // x = -y
      // moves: 'C4C5D6C7C6D3E6D7C2B3A2F5C8E3G5B6A5H5F6B1H4A4E7G7E2F7G6B7G8G4F4F3D8H7E8F2H8B5A7E1H3D2G2H2C1C3F1D1A1G1G3A6H6F8B2B8A3H1A8B4', // x = 0
      // moves: 'F5D6C3D3C4F4C5B3C2E6B4F3E3E2F1B6G4D2F6E1D1A3F2G5F7D7E7G6H6B1C1G1B5D8E8A6C8C6C7G8F8B8H5H4G3H7A5B7A8A7H8G7H3H2H1G2A1A4A2B2', // y = 0
      moves: 'D3E3F6C6F2C4D6E2D2G1G2C1F5C5B3G5E6E7F7E1E8C2D1F8B5A5D7A2B4A4C3C7C8B6F4B2G4H4G6D8F3B8B1H2H6H5H3G7A3G3G8A1H7H8H1F1A6B7A8A7', // rotational
      newBoard: '-wwwwwwwbwwwwwwwbwwwwwwwbwwwwwwwbwwwwwwwbwwwwwwwbwwwwwwwbwwwwwww',
      maxBoard: 'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
      newName: null,
      row: 0,
      col: 0
    }
  },
  watch: {
    tokenName () {
      if (this.tokenName !== this.newName) {
        this.newName = this.tokenName
      }
    }
  },
  mounted () {
    clover.playGameMovesString(this.moves)
    console.log(clover)
    // console.log(clover.byteArrayToRowArray('55555555555959555955555955555555'))
  },
  computed: {
    ...mapGetters({
      tokenName: 'name',
      tokenSymbol: 'symbol',
      address: 'address',
      amount: 'amount',
      balance: 'balance',
      status: 'status'
    }),
    moveConverted () {
      return clover.stringMovesToBinaryMoves(this.moves)
    },
    moveUnConverted () {
      return clover.binaryMovesToByteMoves(this.moveConverted)
    }
  },
  methods: {
    helloWorld () {
      this.$store.dispatch('helloWorld', this.newName)
    },
    tryFunction () {
      this.$store.dispatch('tryFunction', [this.convertBoard(this.newBoard), this.col, this.row])
    },
    convertBoard (board) {
      return clover.stringBoardToArrayBoard(board)
    },
    sendHandler () {
      this.$store.dispatch('registerGame', this.moveConverted)
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
