<template>
  <div>
    <single-view v-if="viewSingle" :clover="viewSingle" @close="viewSingle = null"></single-view>
    <ul class="list-reset md-flex flex-wrap justify-around items-center m0">
      <li v-for="(clover, i) in picks" :key="i" class="md-col6">
        <div class="flex py2 border-bottom justify-between items-center green">
          <div class="col-3 center relative">
            <div class="sym-badge absolute h7 p1" v-if="isSym(clover)">SYM</div>
            <img :src="cloverImage(clover, 58)" width="58" height="58"/>
          </div>
          <div class="col-3 pr2 h7 font-mono">
            {{ fromNow(clover) }}
          </div>
          <div class="pr2 h6 font-mono">
            <button @click="removeClover(clover)" class="btn btn-big border border-green regular">Remove</button>
          </div>
          <div class="pr3 h6 font-mono">
            <button @click="viewSingle = clover" class="btn btn-big bg-green white nowrap regular">Keep/Sell</button>
          </div>
        </div>
      </li>
    </ul>
    <div class="bg-green white center p2 font-exp">
      <router-link to="/field">Find more</router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { cloverImage } from '@/utils'
import SingleView from '@/views/KeepClover'
import moment from 'moment'

export default {
  name: 'Picks',
  data () {
    return {
      viewSingle: null
    }
  },
  computed: {
    ...mapGetters(['picks', 'pickCount'])
  },
  methods: {
    cloverImage,

    fromNow ({ createdAt }) {
      return moment(createdAt).fromNow()
    },

    isSym (clover) {
      return clover.symmetrical
    },

    ...mapMutations({
      removeClover: 'REMOVE_SAVED_CLOVER'
    })
  },
  components: { SingleView }
}
</script>

<style lang="css" scoped>
  div.sym-badge {
    background: var(--green);
    color: white;
    left: 0.8em;
    top: -0.6em;
    border-radius: 32px;
  }
</style>
