<template>
    <div id="accountMenu" class="border green bg-white absolute">
        <template >
        <div class=" center bold border-bottom pointer" >
            <template  v-if="!authHeader">
                <div @click="signClick" class="p2">Sign In</div>
            </template>
            <template v-else>
                <router-link class="block p2" :to="'/users/' + account">{{userName(user)}}</router-link>
            </template>
        </div>
        <div class="p2 h5 lh3">
            <template v-if="!authHeader">Sign in to edit your profile, make comments and rename Clovers.</template>
            <template v-else>
                <div class="pointer">
                    <router-link @click.native="$emit('closeAccountMenu')" :to="{name: 'Account'}">Your Dashboard</router-link>
                </div>
                <div class="pointer">
                    <router-link @click.native="$emit('closeAccountMenu')" :to="'/users/' + account">Your Profile</router-link>
                </div>
                <div class="pointer">
                    <div @click="signClick" class="pointer">Sign Out</div>
                </div>
            </template>
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
  props: ['visible'],
  computed: {
    ...mapState(['account']),
    ...mapGetters(['authHeader', 'userName', 'user'])
  },
  methods: {
    signClick () {
        this.$emit('closeAccountMenu')
        this.signInOut()
    },
    ...mapActions(['signInOut'])
  }
}
</script>
<style lang="css" scoped>
 #accountMenu {
    top: 65px;
    right: 20px;
    width: 200px;
  }
  #accountMenu:before,
  #accountMenu:after {
        content: '';
        width:0px;
        height:0px;
        border:13px solid transparent;
        border-bottom: 10px solid var(--green);
        position:absolute;
        top:-23px;
        right:15px;
  }
  #accountMenu:after {
      border-bottom: 10px solid var(--white);
      top: -22px;
  }
</style>
