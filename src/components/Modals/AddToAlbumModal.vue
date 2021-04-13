<template lang="pug">
  modal.green(@close="$emit('close')", :cancel="true", :always-top="true")
    form.px3.pt4.pb3.center.relative(@submit.prevent="addToAlbum")
      label.block.font-exp Add Clover to Album
      input.border.mt3.py2.px2.rounded.col-12.input(v-model="query", ref="input", type="search", autocomplete="off", placeholder="Search albums...", v-autofocus="true")
      ul.mt0.mb0.list-reset(v-if="mine && !hasQuery")
        //- li.my1.h5.rounded.left-align Your albums:
        li.my1.h5.rounded.bg-lightest-green.flex.justify-between.py2.px1.border.border-transparent.pointer.hover-border-green.hover-opacity-100(v-for="(album, i) in mine.results", @click.stop="select = i", :class="{'border-green': select === i, 'opacity-50': select !== i && select !== null, 'white': alreadyAdded(album), 'bg-green' : alreadyAdded(album)}")
          h5.col-9.px1.left-align.font-exp {{ album.name }}
            sup.h7.font-mono {{ album.clovers.length }}
          h6.col-3.px1.truncate.right-align {{yours(album) ? "Yours" : alreadyAdded(album) ? 'Added' : ''}}
      ul.mt0.mb0.list-reset(v-else)
        li.my1.h5.rounded.bg-lightest-green.flex.justify-between.py2.px1.border.border-transparent.pointer.hover-border-green.hover-opacity-100(v-for="(album, i) in albums", @click.stop="select = i", :class="{'border-green': select === i, 'opacity-50': select !== i && select !== null, 'white': alreadyAdded(album), 'bg-green' : alreadyAdded(album)}")
          h5.col-9.px1.left-align.font-exp {{album.name}}
            sup.h7.font-mono {{album.clovers.length}}
          h6.col-3.px1.truncate.right-align {{yours(album) ? "Yours" : alreadyAdded(album) ? 'Added' : ''}}
        li.my1.h5.rounded.bg-lightest-green.flex.justify-between.py2.px1.border.border-transparent.opacity-50(v-if="couldCreate && onlyAddedInList")
          h5.col-12.px1.left-align.font-exp {{ searching ? 'Searching...' : 'Album not found' }}

      footer.sticky.mt3.bottom-0.left-0.col-12.center
        button.inline-block.py2.px3.border.rounded-2.bg-green.white.pointer(:disabled="select === null && !couldCreate", :class="{'pointer': select !== null || couldCreate}") {{ couldCreate ? 'Create Album' : 'Confirm' }}
</template>

<script>
import Modal from './Modal'
import { mapState, mapActions } from 'vuex'
import debounce from 'debounce'

export default {
  name: 'AddToAlbumModal',
  props: ['board'],
  data () {
    return {
      query: '',
      searching: false,
      select: null,
      submitting: false,
      mine: null,
      results: null
    }
  },
  computed: {
    hasQuery () {
      return this.query !== '' && this.query !== null
    },
    couldCreate () {
      return this.query !== '' && this.select === null && !this.albums.filter(a => {
        return a.name.toLowerCase() === this.query.toLowerCase()
      }).length
    },
    onlyAddedInList () {
      return !this.albums.filter(a => !this.alreadyAdded(a)).length
    },
    albums () {
      if (!this.results) return []

      return this.results
    },

    ...mapState(['account'])
  },
  watch: {
    query () {
      this.select = null
      if (this.query !== '') {
        this.searching = true
        this.results = null
        this.search()
      }
    }
  },
  methods: {
    search: debounce(function () {
      this.$store.dispatch('searchAlbums', this.query).then((res) => {
        this.results = res
        this.searching = false
      })
    }, 200),

    yours (album) {
      return (this.account && album.userAddress === this.account)
    },
    alreadyAdded (album) {
      return album.clovers.indexOf(this.board) > -1
    },
    async addToAlbum () {
      if (this.submitting) return
      if (this.select === null && !this.couldCreate) return
      let album
      if (this.couldCreate && this.select == null) {
        album = { name: this.query, clovers: [] }
      } else {
        if (this.hasQuery) {
          album = JSON.parse(JSON.stringify(this.albums[this.select]))
        } else {
          album = JSON.parse(JSON.stringify(this.mine.results[this.select]))
        }
      }
      album.clovers.unshift(this.board)
      try {
        this.submitting = true
        this.couldCreate ? await this.createAlbum(album) : await this.updateAlbum(album)
        this.submitting = false
        this.select = null
        this.query = ''
        this.$emit('close')
      } catch (err) {
        this.submitting = false
        console.error(err)
      }
    },

    ...mapActions(['updateAlbum', 'createAlbum'])
  },
  mounted () {
    this.$store.dispatch('getUserAlbums').then((albums) => {
      this.mine = albums
    })
  },
  components: { Modal }
}
</script>
