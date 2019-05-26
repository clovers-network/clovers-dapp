<template lang="pug">
  section.green
    .sticky.left-0.bg-white.z1(style="top:-1px")
      header.border-bottom
        //- username, editable
        .h-header.relative.flex.items-center.justify-center(v-if="signedIn")
          //- not editing
          div.absolute.top-0.left-0.right-0.bottom-0.bg-white.flex(v-show="!formFocussed")
            label.pointer.h-100.input.truncate.flex-auto.center.px4.font-mono(for="uname")
              span(v-text="form.name || user.address")
              span.h-100.px2.regular.nowrap
                span.flip-x.m-auto.on-hover ✎
          //- editing
          form.col-12.h-100(@submit="updateName")
            input#uname.input.font-mono.center.col-12.px4(@focus="focusUsername", @blur="blurUsername", @keyup.enter="blurUsername" ref="nameInput", placeholder="name", v-model="form.name", autocomplete="off")
            transition(name="fade")
              button.pointer.absolute.right-0.top-0.p2(v-if="formFocussed", type="submit" @click.prevent="() => null")
                img(src="~../assets/icons/arrow-right.svg", width="18", height="18")
        //- else, Login
        .h-header.font-mono.flex.px2.flex(v-else)
          button.block.p2.m-auto.h6.regular.pointer(@click="signIn") Login
            span(v-if="account" class="truncate")  as {{name.substr(0,7) + (name.length > 7 ? '...' : '')}}
      view-nav(ref="nav", :items="navItems", :initial="$route.name" @change="$router.push({name: $event})")
    section
      router-view
</template>

<script>
import store from '@/store'
import { mapActions, mapGetters, mapState } from 'vuex'
import ViewNav from '@/components/ViewNav'

export default {
  name: 'Account',
  head: {
    title: { inner: 'Account' },
    meta: [ { name: 'description', content: 'Your active profile', id: 'meta-desc' } ]
  },
  data () {
    return {
      formFocussed: false,
      form: { name: null }
    }
  },
  computed: {
    name () {
      return this.user && this.user.name || this.account
    },
    signedIn () {
      return !!this.$store.getters.authHeader
    },
    navItems () {
      return [
        { lbl: 'Picked', value: 'Account' },
        { lbl: 'Owned', value: 'Account/Clovers' },
        {
          lbl: '<span class=font-mono>' + this.prettyUserBalance + ' ♣&#xFE0E;</span>',
          value: 'Account/Trade'
        }
      ]
    },

    ...mapState(['account']),
    ...mapGetters(['prettyUserBalance', 'user'])
  },
  methods: {
    checkEsc (e) {
      if (e.keyCode === 27) {
        this.form.name = this.name
        this.formFocussed = false
      }
    },
    focusUsername () {
      window.addEventListener('keyup', this.checkEsc)
      setTimeout(() => {
        this.formFocussed = true
      }, 100)
    },
    blurUsername () {
      this.updateName()
    },
    updateName () {
      window.removeEventListener('keyup', this.checkEsc)
      setTimeout(() => {
        this.formFocussed = false
      }, 50)
      if (!this.form.name.length || !this.user) return
      if (this.form.name === this.name) return
      if (this.form.name.trim() === '') this.form.name = this.user.address
      this.changeUsername({
        address: this.user.address,
        name: this.form.name
      })
    },

    ...mapActions(['changeUsername', 'signIn'])
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
.router-link-active {
  opacity: 1;
}
/* highlight bar */
[data-view='Account/Clovers'] {
  transform: translateX(100%);
}
[data-view='Account/Trade'] {
  transform: translateX(200%);
}
.on-hover {
  visibility: hidden;
  margin-right:-37.41px;
}
label:hover .on-hover {
  visibility: visible;
}
</style>
