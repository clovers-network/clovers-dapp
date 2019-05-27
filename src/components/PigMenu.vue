<template>
    <div id="pigMenu" class="border green bg-white absolute">
        <template >
        <div class=" center bold border-bottom pointer" >
           <div class="p2">{{mining ? 'Your Pig is Running' : 'Your Pig is Paused'}}</div>
        </div>
        <div class="p2 h5 lh3">
           <div class="pointer" @click="triggerPig">{{mining ? 'Stop Pig' : 'Start Pig'}}</div>
        </div>
        </template>
    </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex'
export default {
  name: 'AcountMenu',
  data () {
    return {
    }
  },
  props: ['mining'],
  computed: {
    ...mapState(['account']),
    ...mapGetters(['authHeader', 'userName', 'user'])
  },
  methods: {
    triggerPig () {
      this.$emit('triggerPig')
    },
    ...mapActions(['signInOut'])
  }
}
</script>
<style lang="css" scoped>
 #pigMenu {
    top: 65px;
    right: 180px;
    width: 200px;
  }
  #pigMenu:before,
  #pigMenu:after {
        content: '';
        width:0px;
        height:0px;
        border:13px solid transparent;
        border-bottom: 10px solid var(--green);
        position:absolute;
        top:-23px;
        right:15px;
  }
  #pigMenu:after {
      border-bottom: 10px solid var(--white);
      top: -22px;
  }
</style>
