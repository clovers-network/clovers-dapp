<template>
  <div id="app">
    <app-header></app-header>
    <main>
      <router-view></router-view>
      <div class="p2">
        <div v-if="allClovers.length" class="mt3 px2">
          <ul class="list-reset flex flex-wrap mxn2">
            <li v-for="board in cloversSorted" :key="board.board" class="px2 mb3">
              <clover-grid-item :board="board"></clover-grid-item>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
  import AppHeader from '@/components/AppHeader'
  import { mapGetters, mapMutations } from 'vuex'

  export default {
    name: 'app',
    data () {
      return {
      }
    },
    computed: {
      cloversSorted () {
        return this.allClovers.sort((a, b) => b.modified - a.modified)
      },

      ...mapGetters({
        account: 'account',
        clover: 'clover',
        allClovers: 'allClovers'
      })
    },
    methods: {
      ...mapMutations({
        updateClover: 'UPDATE_CLOVER',
        registerEvent: 'ADD_REGISTERED_EVENT',
        registerEvents: 'ADD_REGISTERED_EVENTS'
      })
    },
    mounted () {
      this.clover.initWeb3()

      window.addEventListener('updateCloverObject', (e) => {
        this.updateClover(e.detail)
      }, false)
      window.addEventListener('eventRegistered', (e) => {
        this.registerEvent(e.detail)
      }, false)
      window.addEventListener('eventsRegistered', (e) => {
        this.registerEvents(e.detail)
      }, false)
    },
    destroyed () {
      this.clover.stopAccountInterval()
      this.clover.stopEvents()
      window.removeEventListener('Event', 'eventRegistered')
      window.removeEventListener('Event', 'eventsRegistered')
    },
    components: { AppHeader }
  }
</script>

<style >
  @import './style/imports';
  @import './style/global';
</style>
