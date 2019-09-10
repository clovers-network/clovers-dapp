<template lang="pug">
  modal.green(@close="close", :cancel="true")
    .mx3.pb4.pt3.mt1
      h4.font-exp.center.lh1 New Album
      form.mt2.pt1(@submit.prevent="submit")
        label.hide Album Name
        input.border.py2.px2.rounded.col-12.input(v-model="album.name", name="clover-album-name", type="text", autocomplete="off", placeholder="Album Name", v-autofocus="true", @input="clearErrors", :disabled="submitting", required)
        .my2.red.center.h5(v-if="error") {{ error.data || error.statusText || "That didn't work..." }}
        .mt3.center
          input.font-ext.pointer.py2.px3.rounded.bg-green.white(type="submit", value="Create", :disabled="submitting")
</template>

<script>
import Modal from './Modal'
import { mapActions } from 'vuex'

export default {
  name: 'AddAlbumModal',
  data () {
    return {
      album: {
        name: '',
        clovers: []
      },
      submitting: false,
      error: null
    }
  },
  methods: {
    async submit () {
      try {
        this.submitting = true
        await this.createAlbum(this.album)
        this.$emit('close')
      } catch (err) {
        this.error = err.response
        this.submitting = false
      }
    },
    close () {
      this.album.name = ''
      this.error = null
      this.submitting = false
      this.$emit('close')
    },
    clearErrors () {
      if (this.error) {
        this.error = null
      }
    },

    ...mapActions(['createAlbum'])
  },
  components: { Modal }
}
</script>
