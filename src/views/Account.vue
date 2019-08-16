<template lang="pug">
  article
    header
      user-card(:user="user", :editable="true", @edit="signOrEdit")

    section.mx2.sm-mx3.md-mx0
      //- Basket
      section.my4.sm-mt0(name="My unregistered Clovers")
        h2.h2.md-h2.mt2.md-mt3.mb1.font-exp
          router-link(:to="{ name: 'Picks' }") Basket
        //- (picks)
        div(v-if="pickCount")
          p.h5 You have <strong>{{ pickCount }}</strong> unregistered {{ pluralize('Clover', pickCount) }}
          .mxn2.mt3
            ul.list-reset.items-center.m0.nowrap.overflow-visible
              pick-list-item.inline-block(v-for="(pick, i) in pickList" :key="pick.byteBoard" :pick="pick" :data-key="pick.board" :style="fadeOut(i)", :diameter="128")
          nav.mt3
            router-link.h5.inline-block.green.border.px3.py2.rounded-2.hover-bg-l-green(:to="{ name: 'Picks' }")
              span View All
        //- (empty)
        div(v-else)
          p.max-width-1 Your basket contains unregistered Clovers that you picked from the <strong>Field</strong>, or symmetrical Clovers mined by the <strong>Clover Pig</strong>
          .mxn2
            ul.list-reset.items-start.m0.nowrap.overflow-hidden
              pick-list-item.inline-block
          p
            router-link(to="/field")
              span.underline Pick some now
              span.font-mono.bold &nbsp;&rarr;

      //- Clovers
      section.my4.sm-mt0(name="My Clovers")
        h2.h3.md-h2.mt2.md-mt3.mb1.font-exp
          router-link(to="/account/clovers") Collection
        template(v-if="cloversCount")
          p.h5 You have <strong>{{ cloversCount }}</strong> registered {{ pluralize('Clover', cloversCount) }}
          .mt3.px1.sm-px0
            clover-list-cards(:clovers="clovers")
          nav.mt2.md-mt0.flex.justify-center.sm-block
            router-link.h5.inline-block.green.border.px3.py2.rounded-2.hover-bg-l-green(to="/account/clovers")
              span View All
        template(v-else)
          p.max-width-1 Clovers that are registered to your account (wallet address). Save some from your basket and they will show up here.

    //- Albums
    section.my4.sm-mt0(name="My Clovers")
      h2.h3.md-h2.mt2.md-mt3.mb1.font-exp
        router-link(:to="{name: 'User/Albums', params: {addr: account}}") Albums
      p.h5 You have <strong>{{ albums.length }}</strong> {{ pluralize('Album', albums.length) }}
      //- (about albums)
      p.my3.rounded.bg-lightest-green.p2(v-if="!albums.length") Albums are for grouping clovers together. You can add any clover to your albums, even ones you don't own. Additionally, anyone can add to your album, but only you can edit it.
      //- (albums list)
      .mt3.px1.sm-px0(v-else)
        album-list-cards(:albums="albums", :limit="4")
      nav.mt2.md-mt0.flex.justify-center.sm-block
        .inline-block.green.border.px3.py2.rounded-2.hover-bg-l-green.mr2(v-if="albums.length")
          router-link.h5.flex.items-center.justify-center(:to="{name: 'Albums', params: {addr: account}}")
            | View All
        .inline-block.green.border.px3.py2.rounded-2.hover-bg-l-green
          router-link.h5.flex.items-center.justify-center.pointer(:to="{hash: 'add-album'}")
            | Add Album

    footer.py2.center
      p.h1(style="filter:hue-rotate(292deg)") ☘️

    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal")

    transition(name="fade")
      div(v-if="editing")
        edit-user(@cancel="editing = false")

    transition(name="fade")
      add-album-modal(v-show="$route.hash === '#add-album'", @close="$router.push({hash: ''})")
</template>

<script>
import store from '@/store'
import { mapActions, mapGetters, mapState } from 'vuex'
import { pluralize, cloverImage } from '@/utils'
import UserCard from '@/components/UserCard'
import KeepClover from '@/views/KeepClover'
import PickListItem from '@/components/PickListItem'
import CloverListCards from '@/components/CloverList--Cards'
import EditUser from '@/components/EditUser'
import CoinIcon from '@/components/Icons/CoinIcon'
import AddAlbumModal from '@/components/Modals/AddAlbumModal'
import AlbumListCards from '@/components/AlbumList--Cards'

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
    albums () {
      return this.allAlbums.filter(a => a.userAddress === this.user.account)
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

    ...mapState(['account', 'allAlbums']),
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

    ...mapActions(['getPagedClovers', 'signIn', 'getAllAlbums'])
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
    this.getAllAlbums()
  },
  components: { UserCard, KeepClover, PickListItem, CloverListCards, EditUser, CoinIcon, AddAlbumModal, AlbumListCards }
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
