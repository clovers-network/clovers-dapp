<template lang="pug">
  article
    header
      user-card(:user="user", :editable="true", @edit="signOrEdit")

    section
      //- Basket
      section.my4.sm-mt0(name="My unregistered Clovers")
        h2.mx2.sm-mx3.md-mx0.h2.md-h2.mt2.md-mt3.mb1.font-exp
          router-link(:to="{ name: 'Picks' }") Basket
        //- (picks)
        template(v-if="pickCount")
          p.h5.mx2.sm-mx3.md-mx0 You have <strong>{{ pickCount }}</strong> unregistered {{ pluralize('Clover', pickCount) }}
          .mt3.relative
            .overflow-x-scroll.lg-overflow-x-hidden.py2.touch-scroll.invisible-scrollbar
              ul.list-reset.m0.nowrap
                pick-list-item.inline-block(v-for="(pick, i) in picks", :key="pick.byteBoard", :pick="pick", :data-key="pick.board", :diameter="128", v-if="i < 8")
            .absolute.overlay.pointer-events-none(style="background:linear-gradient(to left, white 8%, rgba(255,255,255,0) 85%)")
          nav.mt3.mx2.sm-mx3.md-mx0
            router-link.h5.inline-block.green.border.px3.py2.rounded-2.hover-bg-l-green(:to="{ name: 'Picks' }")
              span View All
        //- (empty)
        template(v-else)
          p.my3.rounded.bg-lightest-green.p2 Your <b>Basket</b> is where clovers picked from your <router-link to="/garden">Garden</router-link>, or symmetrical clovers found by your Clover Pig are saved.
          nav.mt3
            router-link.h5.inline-block.green.border.px3.py2.rounded-2.hover-bg-l-green(to="/garden")
              | Pick Clovers

      //- Clovers
      section.my4.sm-mt0.mx2.sm-mx3.md-mx0(name="My Clovers")
        h2.h3.md-h2.mt2.md-mt3.mb1.font-exp
          router-link(to="/account/clovers") Collection
        //- (clovers list)
        template(v-if="cloversCount")
          p.h5 You have <strong>{{ cloversCount }}</strong> registered {{ pluralize('Clover', cloversCount) }}
          .mt3.px1.sm-px0
            clover-list-cards(:clovers="clovers")
        //- (no clovers)
        template(v-else)
          p.my3.rounded.bg-lightest-green.p2 Clovers registered to your wallet address will appear here.
        nav.mt2.md-mt0.flex.justify-center.sm-block
          .h5.inline-block.green.border.rounded-2.hover-bg-l-green
            //- (view all)
            router-link.px3.py2.block(v-if="cloversCount", :to="{name: 'User', params: {addr: user.address}}")
              | View All
            //- (sign in)
            button.px3.py2.block.pointer(v-else-if="!signedIn", @click="signIn") Sign In...

      //- Albums
      section.mx2.sm-mx3.md-mx0.my4.sm-mt0(name="My Clovers", v-if="signedIn")
        header.mt2.md-mt3.flex.items-center.justify-between
          .flex-auto
            h2.h3.md-h2.mb1.font-exp
              router-link(:to="{name: 'User/Albums', params: {addr: account}}") Albums
            p.h5 You have <strong>{{ userAlbums.length }}</strong> {{ pluralize('Album', userAlbums.length) }}
          //- btn: new
          button.ml3.h5.green.border.px3.p2.rounded-2.hover-bg-l-green.flex.items-center.justify-center.pointer(@click="newAlbum = true")
            | New
        //- (about albums)
        p.my3.rounded.bg-lightest-green.p2(v-if="!userAlbums.length") <b>Albums</b> are for grouping clovers together. You can add <i>any</i> clover to your albums, even ones you don't own. Anyone else can add to your albums, but only you can edit them.
        //- (albums list)
        .mt3.px1.sm-px0
          album-list-cards(:albums="userAlbums", :limit="4", :newBtn="true")
        nav.mt2.md-mt0.flex.justify-center.sm-block
          .inline-block
            router-link.h5.inline-block.green.border.px3.py2.rounded-2.hover-bg-l-green(v-if="userAlbums.length", :to="{name: 'User/Albums', params: {addr: account}}")
              | View All

    footer.py2.center
      p.h1(style="filter:hue-rotate(292deg)") ☘️

    transition(name="fade")
      div(v-if="showPickModal")
        keep-clover(:movesString="showPickModal")

    transition(name="fade")
      div(v-if="editing")
        edit-user(@cancel="editing = false")

    transition(name="fade")
      add-album-modal(v-show="newAlbum", @close="newAlbum = false")
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
      newAlbum: false
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
      'userImage',
      'userAlbums'
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

    ...mapActions(['getPagedClovers', 'signIn', 'getAllAlbums'])
  },
  watch: {
    account () {
      this.$nextTick(() => {
        this.query()
      })
    }
  },
  mounted () {
    this.query()
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
