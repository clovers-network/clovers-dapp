<template lang="pug">
  nav#accountMenu.border.green.bg-white.absolute.no-select
    .center.border-bottom.pointer
      template(v-if="!authHeader")
        button.block.col-12.pointer.p2(@click="signClick") Sign In
      template(v-else)
        router-link.block.p2(to="/account") {{ userName(user) }}
    .h5
      .p2.lh2.center(v-if="!authHeader") Sign in to edit your Profile, leave comments, and rename clovers
      .md-p2.lh3(v-else)
        div
          router-link.block.md-inline.p2.md-p0.border-bottom.md-border-none(:to="{name: 'Account'}", @click.native="$emit('closeAccountMenu')") Your Dashboard
        div
          router-link.block.md-inline.p2.md-p0.border-bottom.md-border-none(:to="'/users/' + account", @click.native="$emit('closeAccountMenu')") Your Profile
        div
          button.block.md-inline.col-12.p2.md-p0.left-align(@click="signClick") Sign Out
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
