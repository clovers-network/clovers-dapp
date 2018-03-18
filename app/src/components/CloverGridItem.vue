<template>
  <router-link :to="link" tag="div" class="pointer gridItem relative">
    <div class="center muted mb2 h5" v-text="timeAgo"></div>
    <!-- <div class="center silver mb2">by {{board.previousOwners[0]}}</div> -->
    <div>
    <clv :show-flags="true" :no-click="true" :byteBoard="board.board"></clv>
      <div class="h1 center mt2 max-fit overflow-hidden" ><code v-html="boardName"></code></div>
      <div class="center mt2 max-fit overflow-hidden" v-html="boardOwner"></div>
      <div class="center mt2">
        <span>{{ price }}</span> &clubs; /
        <span>{{ flippers }}</span> &orarr;
      </div>
    </div>
  </router-link>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import moment from 'moment'
  export default {
    name: 'clover-grid-item',
    data () {
      return {
      }
    },
    props: {
      board: {
        type: Object,
        required: true
      },
      byFlip: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      boardName () {
        let name = this.board.name || this.board.board
        return name && (name.length > 9 ? name.slice(0, 9) + '&hellip;' : name)
      },
      boardOwner () {
        let address = this.board.previousOwners && this.board.previousOwners[ this.board.previousOwners.length - 1 ]
        let owner = this.users.find((u) => u.address === address)
        owner = owner && owner.address && owner.name || address
        return owner && 'Owned By: ' + (owner.length > 9 ? owner.slice(0, 9) + '&hellip;' : owner)
      },
      flippers () {
        return this.board && this.board.previousOwners && this.board.previousOwners.length - 1
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
      timeAgo () {
        return this.byFlip && this.flippers ? this.flipped : this.discovered
      },
      discovered () {
        return 'Found ' + moment(this.board.created * 1000).startOf('hour').fromNow()
      },
      flipped () {
        return 'Flipped ' + moment(this.board.modified * 1000).startOf('hour').fromNow()
      },
      ...mapState(['users']),
      ...mapGetters([
        'symmetries'
      ])
    }
  }
</script>
<style lang="scss" >
.gridItemBadge {
  .multipleBagde, .rareBadge {
    min-width:6em;
    border-radius: 0.5em;
  }
}
</style>
