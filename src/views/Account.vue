<template lang="pug">
  section.green
    header.border-bottom
      div.h-header.px2
        div.pr4.relative.font-mono(v-if="signedIn")
          div.absolute.top-0.left-0.right-0.bg-white.flex(v-if="!formFocussed")
            label.input.truncate.flex-auto(v-text="form.name")
            div.py2
              label.h6.py2.regular.nowrap.claimed(for="uname") Change username
          form(@submit.prevent="updateName")
            input#uname.input.font-mono(@focus="focusUsername", @blur="blurUsername", ref="nameInput", placeholder="name", v-model="form.name", autocomplete="off")
            transition(name="fade")
              button.absolute.right-0.top-0.p2(v-if="formFocussed", type="submit")
                img(src="~../assets/icons/arrow-right.svg", width="18", height="18")
        div.relative.font-mono.flex(v-else)
          p.input.truncate.flex-auto(v-text="form.name")
          div.pt2
            label.h6.py2.regular.nowrap.claimed(@click="signIn") Login
    section
      view-nav(ref="nav", :items="navItems", :initial="$route.name" @change="$router.push({name: $event})")
      router-view
</template>

<script>
import { mapActions } from 'vuex'
import ViewNav from '@/components/ViewNav'

export default {
  name: 'Account',
  data () {
    return {
      formFocussed: false,
      form: { name: null },
      navItems: [
        {lbl: 'Picks', value: 'Account'},
        {lbl: 'My Clovers', value: 'Account/Clovers'},
        {lbl: '<span class=font-mono>34,484 ♣</span>', value: 'Account/Trade'}
      ]
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    signedIn () {
      return !!this.$store.getters.authHeader
    }
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
