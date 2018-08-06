<template lang="pug">
  section.green
    header.border-bottom
      //- username, editable
      .h-header.relative.flex.items-center.justify-center(v-if="signedIn")
        div.absolute.top-0.left-0.right-0.bg-white.flex(v-show="!formFocussed")
          label.input.truncate.flex-auto.center.px4.font-mono(v-text="form.name")
          label.absolute.top-0.right-0.h-100.px2.block.regular.nowrap.flex(for="uname")
            span.block.flip-x.m-auto ✎
        form(@submit.prevent="updateName")
          input#uname.input.font-mono.center(@focus="focusUsername", @blur="blurUsername", ref="nameInput", placeholder="name", v-model="form.name", autocomplete="off")
          transition(name="fade")
            button.absolute.right-0.top-0.p2(v-if="formFocussed", type="submit")
              img(src="~../assets/icons/arrow-right.svg", width="18", height="18")
      //- else, Login
      .h-header.font-mono.flex.px2.flex(v-else)
        button.block.p2.m-auto.h6.regular.opacity-50(@click="signIn") Login
    section
      view-nav(ref="nav", :items="navItems", :initial="$route.name" @change="$router.push({name: $event})")
      router-view
</template>

<script>
import store from '@/store'
import { mapActions, mapGetters } from 'vuex'
import ViewNav from '@/components/ViewNav'

export default {
  name: 'Account',
  data () {
    return {
      formFocussed: false,
      form: { name: null }
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    signedIn () {
      return !!this.$store.getters.authHeader
    },
    navItems () {
      return [
        {lbl: 'Picks', value: 'Account'},
        {lbl: 'My Clovers', value: 'Account/Clovers'},
        {lbl: '<span class=font-mono>' + this.userBalance + ' ♣</span>', value: 'Account/Trade'}
      ]
    },
    ...mapGetters(['userBalance'])
  },
  methods: {
    focusUsername () {
      this.formFocussed = true
    },
    blurUsername () {
      this.formFocussed = false
    },
    updateName () {
      this.$refs.nameInput.blur()
      this.changeUsername({
        address: this.user.address,
        name: this.form.name
      })
    },

    ...mapActions([
      'changeUsername',
      'signIn'
    ])
  },
  watch: {
    '$route.name' (val) {
      this.$refs.nav.setActive(val)
    },
    user (newVal) {
      if (!newVal) return
      this.form.name = newVal.name
    }
  },
  mounted () {
    if (!this.user) return
    this.form.name = this.user.name
  },
  beforeRouteEnter (to, from, next) {
    return store.dispatch('getClovers').then(() => {
      next()
    })
  },
  components: { ViewNav }
}
</script>

<style scoped>
.router-link-active{
  opacity:1;
}
/* highlight bar */
[data-view="Account/Clovers"]{transform:translateX(100%);}
[data-view="Account/Trade"]{transform:translateX(200%);}
</style>
