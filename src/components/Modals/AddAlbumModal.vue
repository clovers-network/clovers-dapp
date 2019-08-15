<template lang="pug">
  modal.green(@close="$emit('close')", :cancel="true")
    .mx3.pb4.pt3.mt1
      h4.font-exp.center.lh1 New Album
      form.mt2.pt1(@submit.prevent="submit")
        label.hide Album Name
        input.border.py2.px2.rounded.col-12.input(v-model="album.name", name="clover-album-name", type="text", autocomplete="off", placeholder="Album Name", v-autofocus="true", required)
        .my2.red.center.h5(v-if="error") {{error}}
        .mt3.center
          input.font-ext.pointer.py2.px3.rounded.bg-green.white(type="submit", value="Create")
</template>

<script>
import Modal from './Modal'
export default {
  name: 'AddAlbumModal',
  data () {
    return {
      album: {
        name: ''
      },
      error: null
    }
  },
  methods: {
    submit () {
      // this.$store.dispatch('createAlbum', {name: this.album.name})
    }
  },
  components: { Modal }
}
</script>

<style>
</style>
