<template>
  <div class="max-width-3 mx-auto p1">
    <div class="h1 my3">
      Activity</div>
    <div class="center mb4">
      <span
      @click="asc = !asc"
      :class="sortableClass"
      class="inline-block mx2 pointer no-select">
        Block Number
      </span>
    </div>
    <ul class="mx-auto">
      <li class='mb1  table' v-for="activity in pagedActivity">
        <div class='h4  table' v-if="activity.event === 'Registered'">
          <span class="align-middle table-cell"> Block {{activity.blockNumber}} —</span>
          <router-link class="align-middle table-cell px1" :to="'/users/' + activity.args.newOwner">
            <span   v-html="getName(activity.args.newOwner)"></span>
          </router-link>
          <span  class="align-middle table-cell" v-if="activity.args.newBoard"> claimed </span>
          <span  class="align-middle table-cell" v-else>Flipped</span>
          <router-link class="align-middle table-cell px1" :to="'/clovers/' + activity.args.board">
            <clv :key="activity.args.board" class=' small-clover no-hover' :no-click="true" :byteBoard="activity.args.board"></clv>
          </router-link>
          <span  class="align-middle table-cell" v-if="activity.args.newBoard">for {{parseInt(activity.args.findersFee)}}♧ with initial price {{parseInt(activity.args.lastPaidAmount)}} ♧</span>
          <span  class="align-middle table-cell" v-else>for {{parseInt(activity.args.lastPaidAmount)}} ♧</span>
        </div>
        <div class='h4  table my2' v-else-if="activity.event === 'newUserName'">
          <span class="align-middle table-cell"> Block {{activity.blockNumber}} —</span>
          <router-link class="align-middle table-cell px1" :to="'/users/' + activity.args.player">
            <span  v-html="activity.args.player.slice(0,8) + '&hellip;'"></span>
          </router-link>
          <span class="align-middle table-cell"> changed their name to</span>
          <span class="align-middle table-cell px1">{{filter(activity.args.name)}}</span>
        </div>
        <div class='h4  table' v-else-if="activity.event === 'newCloverName'">
          <span class="align-middle table-cell"> Block {{activity.blockNumber}} —</span>
          <router-link class="align-middle table-cell px1" :to="'/clovers/' + activity.args.board">
            <clv :key="activity.args.board" class=' small-clover no-hover' :no-click="true" :byteBoard="activity.args.board"></clv>
          </router-link>
          <span class="align-middle table-cell"> renamed </span>
          <span class="align-middle table-cell px1">{{filter(activity.args.name)}}</span>
        </div>
        <div v-else>
          <pre>{{activity}}</pre>
        </div>
      </li>
    </ul>
    <div class="center mt4" :class="{hide: pagedTotal === 1}">
      <button
        class="btn btn-outline mb1 blue"
        :disabled="!prevPossible"
        @click="paged--">←</button>
        <button
        class="btn btn-outline mb1 blue"
        :disabled="!nextPossible"
        @click="paged++">→</button>
      </div>
      <div class="center"  :class="{hide: pagedTotal === 1}">
        <span>{{paged}} / {{pagedTotal}}</span>
      </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import xss from 'xss'
  export default {

    name: 'Activity',

    data () {
      return {
        paged: 1,
        limit: 5,
        asc: false
      }
    },
    computed: {
      sortableClass () {
        return {
          gray: true,
          asc: this.asc,
          desc: !this.asc
        }
      },
      pagedTotal () {
        return Math.floor(this.allActivity.length / this.limit) + (this.allActivity.length % this.limit && 1)
      },
      prevPossible () {
        return this.paged > 1
      },
      nextPossible () {
        return this.paged < this.pagedTotal
      },
      sortedActivity () {
        return this.allActivity.sort((a, b) => this.asc ? a.blockNumber - b.blockNumber : b.blockNumber - a.blockNumber)
      },
      startSlice () {
        return (this.paged - 1) * this.limit
      },
      endSlice () {
        return this.paged * this.limit
      },
      pagedActivity () {
        return this.sortedActivity.slice(this.startSlice, this.endSlice)
      },
      allActivity () {
        return this.registeredEvents.map((r) => {
          return r
        }).concat(...this.usernameEvents.map((u) => {
          return u
        })).concat(...this.clovernameEvents.map((c) => {
          return c
        }))
      },
      ...mapGetters([
        'registeredEvents',
        'usernameEvents',
        'clovernameEvents',
        'allUsers'
      ])
    },
    methods: {
      filter (word) {
        return xss(word)
      },
      getName (address) {
        let user = this.allUsers.find((u) => u.address === address)
        return user && user.name || address
      }
    }
  }
</script>

<style lang="css" scoped>
.small-clover {
  line-height:1px;
  size:1px;
  font-size:5px;
}
</style>
