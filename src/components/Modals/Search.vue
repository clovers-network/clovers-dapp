<template lang="pug">
  .fixed.overlay.z5.bg-white-a70.flex.p2.md-py4.items-start(@mousedown.self="$emit('close')", v-on:keydown.esc="close")
    .relative.col-12.mx-auto.my4.md-my3.border.border-dashed.rounded-2.max-width-3.bg-white.shadow
      form
        .flex.items-center.h1
          img.block.ml3.mr2.sm-mr3(src="@/assets/icons/search.svg", style="height:.9em")
          input.block.col-12.h-bttm-bar.pr3(ref="input", name="search", type="search", v-model="query", placeholder='Search', spellcheck="false", autocomplete="off")
      ul.list-reset.m0.h3.pointer.overflow-y-scroll.touch-scroll(v-if="query.length", style="max-height:calc(100vh - 20rem)", @click="close")

        //- matches go here
        li.p3.bg-lightest-green.center.light-green(v-if="searching") Searching...
        li.p3.bg-lightest-green.center.light-green(v-if="hasQuery && !hasResults && !searching") Nothing found :(
        template(v-if="hasUsers")
          li.p3.bg-lightest-green Found {{ hasUsers }} {{ pluralize('User', hasUsers) }} &crarr;
          li.p3.truncate.hover-bg-l-green(v-for="user in results.users", :key="user.address", is="router-link", tag="li", :to="userLink(user)")
            .flex.items-center
              figure.pr2.flex-none
                img.block(:src="userImage(user, 80)" width="50" height="50", alt="User Avatar")
              .flex-auto.ml1
                .h3 {{ userName(user) }}
                .font-mono.light-green.truncate {{ user.address }}

        template(v-if="hasAlbums")
          li.p3.bg-lightest-green Found {{ hasAlbums }} {{ pluralize('Album', hasAlbums) }} &crarr;
          li.p3.truncate.hover-bg-l-green(v-for="album in results.albums", :key="album.id", is="router-link", tag="li", :to="albumLink(album)")
            .h3 {{ album.name }}
              sup.h6.font-mono {{ album.clovers.length }}
            .font-mono.light-green.truncate {{ album.id }}

        //- li.p3.truncate.hover-bg-l-green.bg-lightest-green
          span.opacity-50.mr1 Clovers named
          | "{{query}}" &crarr;

        template(v-if="query.toLowerCase() === 'me' && !searching")
          li.p3.truncate.hover-bg-l-green Your Profile
          li.p3.truncate.hover-bg-l-green Your Account
          li.p3.truncate.hover-bg-l-green Your Clovers
          li.p3.truncate.hover-bg-l-green Your Basket
          li.p3.truncate.hover-bg-l-green Your Albums

</template>

<script>
import { mapGetters } from 'vuex'
import debounce from 'debounce'
import { pluralize } from '@/utils'

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
    hasUsers () {
      return this.results && this.results.userCount
    },
    hasAlbums () {
      return this.results && this.results.albumCount
    },
    hasResults () {
      return this.results && this.results.queryResults
    },

    ...mapGetters(['userName', 'userImage'])
  },
  methods: {
    pluralize,

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
      if (this.query !== '') {
        this.searching = true
        this.results = null
        this.search()
      }
    }
  }
}
</script>
