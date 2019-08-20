<template lang="pug">
  modal.green(@close="$emit('close')", :cancel="true")
    form.px3.pt4.pb3.center.relative(@submit.prevent="addToAlbum")
      label.block.font-exp Add Clover to Album
      input.border.mt3.py2.px2.rounded.col-12.input(v-model="query", ref="input", type="search", autocomplete="off", placeholder="Search albums...", v-autofocus="true")
      ul.mt0.mb0.list-reset
        li.my1.h5.rounded.bg-lightest-green.flex.justify-between.py2.px1.border.border-transparent.pointer.hover-border-green.hover-opacity-100(v-for="(album, i) in albums", @click.stop="select = i", :class="{'border-green': select === i, 'opacity-50': select !== i && select !== null, 'white': alreadyAdded(album), 'bg-green' : alreadyAdded(album)}")
          h5.col-9.px1.left-align.font-exp {{album.name}}
            sup.h7.font-mono {{album.clovers.length}}
          h6.col-3.px1.truncate.right-align {{yours(album) ? "Yours" : alreadyAdded(album) ? 'Added' : ''}}
        li.my1.h5.rounded.bg-lightest-green.flex.justify-between.py2.px1.border.border-transparent.opacity-50(v-if="couldCreate && onlyAddedInList")
          h5.col-12.px1.left-align.font-exp Album not found

      footer.sticky.mt3.bottom-0.left-0.col-12.center
        button.inline-block.py2.px3.border.rounded-2.bg-green.white.pointer(:disabled="select === null && !couldCreate", :class="{'pointer': select !== null || couldCreate}") {{ couldCreate ? 'Create Album' : 'Confirm' }}
</template>

<script>
import Modal from './Modal'
import {mapState, mapActions} from 'vuex'
export default {
  name: 'AddToAlbumModal',
  data () {
    return {
      query: '',
      select: null
    }
  },
  props: ['board'],
  computed: {
    ...mapState(['allAlbums', 'account']),
    couldCreate () {
      return this.query !== '' && this.select === null && !this.albums.filter(a => {
        return a.name === this.query
      }).length
    },
    onlyAddedInList () {
      return !this.albums.filter(a => !this.alreadyAdded(a)).length
    },
    albums () {
      return this.allAlbums.filter(a => {
        var containsString = this.query === '' ? true : a.name.toLowerCase().indexOf(this.query.toLowerCase()) > -1
        return containsString
      }).sort((item1, item2) => {
        if (item1.name.toLowerCase() < item2.name.toLowerCase()) { return -1 }
        if (item1.name.toLowerCase() > item2.name.toLowerCase()) { return 1 }
        return 0
      })
    }
  },
  watch: {
    query () {
      this.select = null
      console.log('query changed')
    }
  },
  methods: {
    ...mapActions(['updateAlbum', 'createAlbum']),
    yours (album) {
      return (this.account && album.userAddress === this.account)
    },
    alreadyAdded (album) {
      return album.clovers.indexOf(this.board) > -1
    },
    async addToAlbum () {
      if (this.select === null && !this.couldCreate) return
      let album
      if (this.couldCreate && this.select == null) {
        album = {name: this.query, clovers: []}
      } else {
        album = JSON.parse(JSON.stringify(this.albums[this.select]))
      }
      album.clovers.unshift(this.board)
      try {
        this.couldCreate ? await this.createAlbum(album) : await this.updateAlbum(album)
        this.select = null
        this.query = ''
        this.$emit('close')
      } catch (err) {
        console.error(err)
      }
    }
  },
  components: { Modal }
}
</script>

<style>
</style>
