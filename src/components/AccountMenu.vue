<template>
  <div
    id="accountMenu"
    class="border green bg-white absolute">
    <template >
      <div class=" center bold border-bottom pointer" >
        <template v-if="!authHeader">
          <div
            class="p2"
            @click="signClick">Sign In</div>
        </template>
        <template v-else>
          <router-link
            to="/account"
            class="block p2">{{ userName(user) }}</router-link>
        </template>
      </div>
      <div class="p2 h5 lh3">
        <template v-if="!authHeader">Sign in to edit your profile, make comments and rename Clovers.</template>
        <template v-else>
          <div class="pointer">
            <router-link
              :to="{name: 'Account'}"
              @click.native="$emit('closeAccountMenu')">Your Dashboard</router-link>
          </div>
          <div class="pointer">
            <router-link
              :to="'/users/' + account"
              @click.native="$emit('closeAccountMenu')">Your Profile</router-link>
          </div>
          <div class="pointer">
            <div
              class="pointer"
              @click="signClick">Sign Out</div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  name: 'AcountMenu',
  props: ['visible'],
  data () {
    return {
    }
  },
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
    top: 50px;
    right: 0px;
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
