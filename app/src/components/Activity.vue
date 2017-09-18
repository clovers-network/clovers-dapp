<template>
  <div class="bg-green">
    <div class="max-width-3 mx-auto p1 ">
      <div class="center py3 px3 mt3 bg-white flex justify-between">
        <div class="h4 ">Event Logs<span v-if="address"> for {{address}}</span></div>
        <span
        @click="asc = !asc"
        :class="sortableClass"
        class="inline-block mx2 pointer no-select">
          Block Number
        </span>
      </div>
      <div class="mx-auto border border-silver p3 bg-white mb3" style="height:500px">
        <ul class="m0 p0 mb3 pb1">
          <li class="mb1 table">
          <div class="h4 table">
            <span v-if="currentBlock" class="align-middle table-cell green">Current Block {{currentBlock}}</span>&nbsp;
          </div>
          </li>
          <li
           class='mb1  table' v-for="activity in pagedActivity">
            <div class='h4  table' v-if="activity.event === 'Registered'">
              <span class="align-middle table-cell"> Block {{activity.blockNumber}} —</span>
              <router-link class="align-middle table-cell px1" :to="'/clovers/' + activity.args.board">
                <clv :key="activity.args.board" class=' small-clover no-hover' :no-click="true" :byteBoard="activity.args.board"></clv>
              </router-link>
              <span  class="align-middle table-cell" v-if="activity.args.newBoard"> claimed by </span>
              <span  class="align-middle table-cell" v-else> flipped by </span>
              <router-link class="align-middle table-cell px1" :to="'/users/' + activity.args.newOwner">
                <span   v-html="getName(activity.args.newOwner)"></span>
              </router-link>
              <span  class="align-middle table-cell" v-if="activity.args.newBoard">for {{parseInt(activity.args.findersFee)}} ♧ with initial price {{parseInt(activity.args.lastPaidAmount)}} ♧</span>
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
          <li class="mb1  table" v-if="pagedActivity.length === 0">
            <div>Go claim some Clover...</div>
          </li>
        </ul>

        <div class="flex justify-between align-middle" >
          <div class=" " :class="{hide: pagedTotal === 1}">
            <button
            class="btn btn-outline mb1 blue"
            :disabled="!prevPossible"
            @click="paged--">←</button>&nbsp;
          </div>

          <div class="center mb2"  :class="{hide: pagedTotal === 1}">
            <span>{{paged}} / {{pagedTotal}}</span>
          </div>

          <div class=" " :class="{hide: pagedTotal === 1}">
            <button
            class="btn btn-outline mb1 blue"
            :disabled="!nextPossible"
            @click="paged++">→</button>&nbsp;
          </div>
        </div>
      </div>
      
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
        asc: false,
        interval: null,
        currentBlock: null
      }
    },
    props: {
      address: {
        type: String,
        default: null
      }
    },
    mounted () {
      this.interval = setInterval(this.checkBlock, 5000)
    },
    destroyed () {
      clearInterval(this.interval)
    },
    methods: {
      checkBlock () {
        this.clover.currentBlock().then((block) => {
          this.currentBlock = block.number
        })
      },
      filter (word) {
        return xss(word)
      },
      getName (address) {
        let user = this.allUsers.find((u) => u.address === address)
        user = user && user.name || address
        if (user.length > 9) user = user.slice(0, 9) + '&hellip;'
        return user
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
        }).filter((r) => {
          return !this.address || r.args.newOwner === this.address
        }).concat(...this.usernameEvents.map((u) => {
          return u
        }).filter((u) => {
          return !this.address || u.args.player === this.address
        })).concat(...this.clovernameEvents.map((c) => {
          return c
        }).filter((c) => {
          return !this.address || c.address === this.address
        }))
      },
      ...mapGetters([
        'clover',
        'registeredEvents',
        'usernameEvents',
        'clovernameEvents',
        'allUsers'
      ])
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
