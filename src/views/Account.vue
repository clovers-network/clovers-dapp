<template lang="pug">
  .green
    section.border.rounded.px2.md-px3.max-width-2.my4.relative(name="My profile")
      .flex.items-center
        .mr3
          img(:src="userImage(user, 87)" width="87" height="87")
        div
          h2.h3.md-h2.mt3.mb0.font-exp
            span.pointer(@click="signOrEdit") {{ name }}
          small.h6(v-if="user.created") Member since block # {{ user.created.toLocaleString() }}
          .mt2.mb3
            span.flex.items-center
              coin-icon
              span.pl1.bold {{ prettyUserBalance }}
      .absolute.top-0.right-0
        a.p2.block.h4.pointer(@click="signOrEdit" style="transform:scale(-1, 1)") ✎

    section(name="My unregistered Clovers")
      h2.h3.md-h2.mt2.md-mt3.mb1.font-exp
        router-link(:to="{ name: 'Picks' }") Basket

      div(v-if="pickCount")
        div
          p You have <strong>{{ pickCount }}</strong> unregistered {{ pluralize('Clover', pickCount) }}
        .mxn2
          ul.list-reset.items-center.m0.nowrap.overflow-visible
            pick-list-item.inline-block(v-for="(pick, i) in pickList" :key="pick.byteBoard" :pick="pick" :data-key="pick.board" :style="fadeOut(i)")

        .py3
          p
            router-link.bg-green.px3.py2.rounded.white(:to="{ name: 'Picks' }")
              span View all

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

    section(name="My Clovers")
      h2.h3.md-h2.mt2.md-mt3.mb1.font-exp
        router-link(to="/account/clovers") My Clovers
      div(v-if="cloversCount")
        p.m0 You have <strong>{{ cloversCount }}</strong> registered {{ pluralize('Clover', cloversCount) }}

        .mt3
          clover-list-cards(:clovers="clovers")

        .py3
          p
            router-link.bg-green.px3.py2.rounded.white(to="/account/clovers")
              span View all
      div(v-else)
        p.max-width-1 Clovers that are registered to your account (wallet address). Save some from your basket and they will show up here.

    .py2.center
      p.h1(style="filter:hue-rotate(292deg)") ☘️

    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal")

    transition(name="fade")
      div(v-if="editing")
        edit-user(@cancel="editing = false")

</template>

<script>
import store from '@/store'
import { mapActions, mapGetters, mapState } from 'vuex'
import { pluralize, cloverImage } from '@/utils'
import KeepClover from '@/views/KeepClover'
import PickListItem from '@/components/PickListItem'
import CloverListCards from '@/components/CloverList--Cards'
import EditUser from '@/components/EditUser'
import CoinIcon from '@/components/Icons/CoinIcon'

export default {
  name: 'Account',
  head: {
    title: { inner: 'Account' },
    meta: [ { name: 'description', content: 'Your active profile', id: 'meta-desc' } ]
  },
  data () {
    return {
      loading: false,
      editing: false,
      form: { name: null }
    }
  },
  computed: {
    name () {
      return this.userName(this.user)
    },
    signedIn () {
      return !!this.$store.getters.authHeader
    },
    profileLink () {
      return `/users/${this.account}`
    },
    cloversUrl () {
      return `${process.env.VUE_APP_API_URL}/users/${this.account || 'anon'}/clovers`
    },

    pickList () {
      return this.picks.slice(0, 8)
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
          value: 'Trade'
        }
      ]
    },

    ...mapState(['account']),
    ...mapGetters([
      'prettyUserBalance',
      'user',
      'picks',
      'pickCount',
      'userName',
      'userImage'
    ])
  },
  methods: {
    pluralize,

    query () {
      if (this.loading) return
      this.loading = true
      this.getPagedClovers({ url: this.cloversUrl }).finally(() => {
        this.loading = false
      })
    },
    signOrEdit () {
      if (this.signedIn) {
        this.editing = true
      } else {
        this.signIn()
      }
    },
    fadeOut (i) {
      if (!i) return
      const o = (100 - (i * 18)) / 100
      return { opacity: o }
    },

    ...mapActions(['getPagedClovers', 'signIn'])
  },
  watch: {
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
    if (!this.user.address) {
      this.$router.push({ name: 'Picks' })
    }
    this.form.name = this.user.name
  },
  components: { KeepClover, PickListItem, CloverListCards, EditUser, CoinIcon }
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
