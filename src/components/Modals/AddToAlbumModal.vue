<template lang="pug">
  modal.green(@close="$emit('close')", :cancel="true")
    form.px3.pt4.pb3.center.relative(@click.prevent="addToAlbum")
      label.block.font-exp Add Clover to Album
      input.border.mt3.py2.px2.rounded.col-12.input(v-model="query", type="search", autocomplete="off", placeholder="Search albums...", v-autofocus="true")
      ul.mt0.mb0.list-reset
        li.my1.h5.rounded.bg-lightest-green.flex.justify-between.py2.px1.border.border-transparent.pointer.hover-border-green.hover-opacity-100(v-for="(album, i) in albums", @click.stop="select = i", :class="{'border-green': select === i, 'opacity-50': select !== i && select !== null}")
          h5.col-6.px1.truncate.left-align.font-exp {{album.name}}
          h6.col-6.px1.truncate.right-align {{album.clovers.length}}
      footer.sticky.mt3.bottom-0.left-0.col-12.center
        button.inline-block.py2.px3.border.rounded-2.bg-green.white.pointer(:disabled="select === null", :class="{'pointer': select !== null}") Confirm
</template>

<script>
import Modal from './Modal'
import {mapState, mapActions} from 'vuex'
export default {
  name: 'AddCloverToAlbumModal',
  data () {
    return {
      query: '',
      select: null
    }
  },
  props: ['board'],
  computed: {
    ...mapState(['allAlbums']),
    albums () {
      return this.allAlbums.filter(a => a.clovers.indexOf(this.board) === -1)
    }
  },
  methods: {
    ...mapActions(['updateAlbum']),
    async addToAlbum() {
      console.log(this.select)
      if (this.select === null) return
      let album = JSON.parse(JSON.stringify(this.albums[this.select]))
      album.clovers.unshift(this.board)
      try {
        await this.updateAlbum(album)
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
