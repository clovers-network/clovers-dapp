<template>
  <router-link :to="link" tag="div" class="pointer">
    <div class="center silver mb2" v-text='timeAgo'></div>
    <!-- <div class="center silver mb2">by {{board.previousOwners[0]}}</div> -->
    <div>
      <clv :board="clover.byteBoardToRowArray(board.board)"></clv>
      <div class="center mt2">
        <span>{{ price }}</span> &clubs; /
        <span>{{ flippers }}</span> &orarr;
      </div>
    </div>
  </router-link>
</template>

<script>
  import moment from 'moment'
  export default {
    name: 'clover-grid-item',
    props: {
      board: {
        type: Object,
        required: true
      }
    },
    computed: {
      flippers () {
        return this.board.previousOwners.length - 1
      },
      price () {
        if (!this.flippers) {
          return this.board.lastPaidAmount.toLocaleString()
        }
        return (this.board.lastPaidAmount * 2).toLocaleString()
      },
      link () {
        return `/clovers/${this.board.board}`
      },
      clover () {
        return this.$store.state.clover
      },
      timeAgo () {
        return 'Discovered ' + moment(this.board.modified).startOf('hour').fromNow()
      }
    }
  }
</script>
