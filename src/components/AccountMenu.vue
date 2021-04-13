<template lang="pug">
  nav#accountMenu.border.green.bg-white.absolute.no-select
    .center.border-bottom.pointer
      template(v-if="!authHeader")
        button.block.col-12.pointer.p2(@click="signClick") Sign In
      template(v-else)
        router-link.block.p2(to="/account") {{ userName(user) }}
    .h5.p2.lh2.center(v-if="!authHeader") Sign in to register clovers, edit your Profile, and leave&nbsp;comments.
    .md-p2.lh3.md-border-bottom(v-else)
      div
        router-link.block.md-inline.p2.md-p0.border-bottom.md-border-none(:to="{name: 'Account'}", @click.native="closeAccountMenu") Your Dashboard
      div
        router-link.block.md-inline.p2.md-p0.border-bottom.md-border-none(:to="'/users/' + account", @click.native="closeAccountMenu") Your Profile
      .hidden.md-block
        button.block.md-inline.col-12.p2.md-p0.left-align(@click="signClick") Sign Out
    .md-p2(:class='{"md-pt2": !authHeader, "lh3": !authHeader, "border-top": !authHeader}')
      div
        router-link.block.md-inline.p2.md-p0.border-bottom.md-border-none(:to="{name: 'Learn'}", @click.native="closeAccountMenu") Tutorial
      div
        a.block.md-inline.p2.md-p0.border-bottom.md-border-none(href="//forum.clovers.network/t/frequently-asked-questions-faq/", @click="closeAccountMenu") FAQ
      div
        a.block.md-inline.p2.md-p0(href="mailto:hello@clovers.network", target="_blank" @click="closeAccountMenu") Contact
    .md-hidden.border-top(v-if="authHeader")
      button.block.col-12.p2.center.bg-lightest-green(@click="signClick") Sign Out
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  name: 'AccountMenu',
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
    closeAccountMenu () {
      this.$emit('closeAccountMenu')
    },
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
