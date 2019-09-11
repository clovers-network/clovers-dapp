<template lang="pug">
  .fixed.overlay.z5.bg-white-a70.flex.p2.md-py4.items-start(@mousedown.self="$emit('close')", v-on:keydown.esc="close")
    .relative.col-12.mx-auto.my4.md-my3.border.border-dashed.rounded-2.max-width-3.bg-white.shadow
      form
        .flex.items-center.h1
          img.block.ml3.mr2.sm-mr3(src="@/assets/icons/search.svg", style="height:.9em")
          input.block.col-12.h-bttm-bar.pr3(ref="input", name="search", type="search", v-model="query", placeholder='Search', spellcheck="false", autocomplete="off")
      ul.list-reset.m0.h3.pointer.overflow-y-scroll.touch-scroll(v-if="query.length", style="max-height:calc(100vh - 20rem)", @click="close")

        //- matches go here
        template(v-if="query.toLowerCase() === 'me' && account")
          li.p3.bg-lightest-green.sticky.top-0(@click.stop) Links &crarr;
          li.p3.truncate.hover-bg-l-green(is="router-link", tag="li", to="/account") Your Account
          li.p3.truncate.hover-bg-l-green(is="router-link", tag="li", :to="profileLink") Your Profile
          li.p3.truncate.hover-bg-l-green(is="router-link", tag="li", to="/account/basket") Your Basket
          li.p3.truncate.hover-bg-l-green(is="router-link", tag="li", :to="profileLink + '/albums'") Your Albums

        li.p3.bg-lightest-green.center.light-green(v-if="searching") Searching...

        template(v-if="hasClovers")
          li.p3.bg-lightest-green.sticky.top-0(@click.stop) Found {{ hasClovers }} {{ pluralize('Clover', hasClovers) }} &crarr;
          li.p3.truncate.hover-bg-l-green(v-for="clover in results.clovers", :key="clover.board", is="router-link", tag="li", :to="cloverLink(clover)")
            .flex.items-center
              figure.pr2.flex-none
                img.block(:src="cloverImage(clover.board, 80)", width="50" height="50" alt="Clover image")
              .flex-auto.ml1
                .h3 {{ clover.name }}
                .font-mono.light-green.truncate {{ userName(clover.user) }}

        li.p3.bg-lightest-green.center.light-green(v-if="hasQuery && !hasResults && !searching") {{ query.length === 1 ? 'Keep typing...' : 'Nothing found :(' }}
        template(v-if="hasUsers")
          li.p3.bg-lightest-green.sticky.top-0(@click.stop) Found {{ hasUsers }} {{ pluralize('User', hasUsers) }} &crarr;
          li.p3.truncate.hover-bg-l-green(v-for="user in results.users", :key="user.address", is="router-link", tag="li", :to="userLink(user)")
            .flex.items-center
              figure.pr2.flex-none
                img.block(:src="userImage(user, 80)" width="50" height="50", alt="User Avatar")
              .flex-auto.ml1
                .h3 {{ userName(user) }}
                .font-mono.light-green.truncate {{ user.cloverCount }} Clovers, {{ user.albumCount }} Albums

        template(v-if="hasAlbums")
          li.p3.bg-lightest-green.sticky.top-0(@click.stop) Found {{ hasAlbums }} {{ pluralize('Album', hasAlbums) }} &crarr;
          li.p3.truncate.hover-bg-l-green(v-for="album in results.albums", :key="album.id", is="router-link", tag="li", :to="albumLink(album)")
            .flex.items-center
              figure.pr2.flex-none
                img.block(:src="cloverImage(album.clovers[0], 80)" width="50" height="50", alt="Album image")
              .flex-auto.ml1
                .h3 {{ album.name }}
                  sup.h6.font-mono {{ album.clovers.length }}
                .font-mono.light-green.truncate by {{ userName(album.user) }}

        //- li.p3.truncate.hover-bg-l-green.bg-lightest-green
          span.opacity-50.mr1 Clovers named
          | "{{query}}" &crarr;

</template>

<script>
import { mapGetters } from 'vuex'
import debounce from 'debounce'
import { pluralize, cloverImage, cloverLink } from '@/utils'

export default {
  name: 'Search',
  props: ['visible'],
  data () {
    return {
      query: '',
      active: 0,
      results: null,
      searching: false
    }
  },
  computed: {
    hasQuery () {
      return this.query !== '' && this.query !== null
    },
    hasClovers () {
      return this.results && this.results.cloverCount
    },
    hasUsers () {
      return this.results && this.results.userCount
    },
    hasAlbums () {
      return this.results && this.results.albumCount
    },
    hasResults () {
      return this.results && this.results.queryResults
    },
    account () {
      return this.$store.state.account
    },
    profileLink () {
      return `/users/${this.account}`
    },

    ...mapGetters(['userName', 'userImage'])
  },
  methods: {
    pluralize,
    cloverImage,
    cloverLink,

    search: debounce(function () {
      this.$store.dispatch('search', this.query).then((res) => {
        this.results = res
        this.searching = false
      })
    }, 200),

    focusInput () {
      if (!this.$refs.input) return
      this.$refs.input.focus()
      this.$refs.input.addEventListener('keydown', this.bindUpDown)
    },
    bindUpDown (e) {
      // if (e.key === 'ArrowDown' || e.keyCode === 40)
    },

    userLink (u) {
      return {
        name: 'User',
        params: { addr: u.address }
      }
    },
    albumLink ({ id }) {
      return {
        name: 'Album',
        params: { id }
      }
    },
    close () {
      this.query = ''
      this.results = null
      this.searching = false
      this.$emit('close')
    }
  },
  watch: {
    visible (vis) {
      if (vis) return this.focusInput()
      this.query = ''
    },
    query () {
      if (this.query !== '' && this.query.length > 1) {
        this.searching = true
        this.results = null
        this.search()
      } else if (this.query && this.query.length === 1) {
        this.results = null
      }
    }
  }
}
</script>
