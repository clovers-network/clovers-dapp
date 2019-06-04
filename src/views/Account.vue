<template lang="pug">
  .green
    section.border-bottom.px2.md-px3(v-if="name" name="My profile")
      h2.h3.md-h2.mt2.md-mt3.mb1.font-exp
        router-link(:to="profileLink") My public profile
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
      p
        span You have <strong>{{ prettyUserBalance }}</strong> Coins (♣&#xFE0E;)

    section.px2.md-px3.bg-green.white.border.border-green(name="My unregistered Clovers")
      h2.h3.md-h2.mt2.md-mt3.mb1.font-exp
        router-link(to="/account/picks") Basket

      div(v-if="pickCount")
        div
          p.m0 You have <strong>{{ pickCount }}</strong> unregistered {{ pluralize('Clover', pickCount) }}
        //- .mxn3
        //-   ul.list-reset.md-flex.flex-wrap.items-center.m0
        //-     pick-list-item(v-for="pick in pickList" :key="pick.board" :pick="pick")

        //-     li.flex-auto.col-12
        //-       p View all
        .mxn2
          ul.list-reset.items-center.m0.nowrap.overflow-hidden
            pick-list-item.inline-block(v-for="pick in pickList" :key="pick.byteBoard" :pick="pick" :data-key="pick.board")

        div
          p
            router-link(to="/account/picks")
              span.underline View all
              span.font-mono.bold &nbsp;&rarr;

      div(v-else)
        div
          p.max-width-1 Your basket contains unregistered Clovers that you picked from the <strong>Field</strong>, or symmetrical Clovers mined by the <strong>Clover Pig</strong>
        .mxn2
          ul.list-reset.items-start.m0.nowrap.overflow-hidden
            pick-list-item.inline-block

        div
          p
            router-link(to="/field")
              span.underline Pick some now
              span.font-mono.bold &nbsp;&rarr;

    section.border-top.px2.md-px3(name="My Clovers")
      h2.h3.md-h2.mt2.md-mt3.mb1.font-exp
        router-link(to="/account/clovers") My Clovers
      div(v-if="cloversCount")
        p.m0 You have <strong>{{ cloversCount }}</strong> registered {{ pluralize('Clover', cloversCount) }}

        .border-top.border-top-dotted.mxn3.mt3.mb2
          clover-list-cards(:clovers="clovers")

        div
          p
            router-link(to="/account/clovers")
              span.underline View all
              span.font-mono.bold &nbsp;&rarr;
      div(v-else)
        p.max-width-1 Clovers that are registered to your account (wallet address). Save some from your basket and they will show up here.

    .border-top.py2.center
      p.h1(style="filter:hue-rotate(292deg)") ☘️

    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal")

</template>

<script>
import store from '@/store'
import { mapActions, mapGetters, mapState } from 'vuex'
import { pluralize, cloverImage } from '@/utils'
import KeepClover from '@/views/KeepClover'
import PickListItem from '@/components/PickListItem'
import CloverListCards from '@/components/CloverList--Cards'

export default {
  name: 'Account',
  head: {
    title: { inner: 'Account' },
    meta: [ { name: 'description', content: 'Your active profile', id: 'meta-desc' } ]
  },
  data () {
    return {
      loading: false,
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
    profileLink () {
      return `/users/${this.account}`
    },
    cloversUrl () {
      if (!this.account) return

      return `${process.env.VUE_APP_API_URL}/users/${this.account}/clovers`
    },

    pickList () {
      return this.picks.slice(0, 6)
    },
    blankCloverImage () {
      return cloverImage('0', 160)
    },
    results () {
      return this.$store.state.pagedClovers
    },
    clovers () {
      if (!this.results || !this.results.results) return []
      return this.results.results.slice(0, 4)
    },
    cloversCount () {
      if (!this.results || !this.results.allResults) return 0
      return this.results.allResults
    },

    showPickModal () {
      return this.$route.query.pick
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
    ...mapGetters(['prettyUserBalance', 'user', 'picks', 'pickCount'])
  },
  methods: {
    checkEsc (e) {
      if (e.keyCode === 27) {
        this.form.name = this.name
        this.formFocussed = false
      }
    },
    pluralize,

    query () {
      if (this.loading) return
      this.loading = true
      this.getPagedClovers({ url: this.cloversUrl }).finally(() => {
        this.loading = false
      })
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

    ...mapActions(['getPagedClovers', 'changeUsername', 'signIn'])
  },
  watch: {
    // '$route.name' (val) {
    //   this.$refs.nav.setActive(val)
    // },
    account () {
      this.$nextTick(() => {
        this.query()
      })
    },
    user (newVal) {
      if (!newVal) return
      this.form.name = newVal.name
    }
  },
  mounted () {
    this.query()
    if (!this.user) return
    this.form.name = this.user.name
  },
  components: { KeepClover, PickListItem, CloverListCards }
}
</script>

<style scoped>
.on-hover {
  visibility: hidden;
  margin-right:-37.41px;
}
label:hover .on-hover {
  visibility: visible;
}
</style>
