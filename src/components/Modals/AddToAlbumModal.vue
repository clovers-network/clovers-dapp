<template lang="pug">
  modal.green(@close="$emit('close')", :cancel="true")
    form.px3.pt4.pb3.center.relative(@click="select = null")
      label.block.font-exp Add Clover to Album
      input.border.mt3.py2.px2.rounded.col-12.input(v-model="query", type="search", autocomplete="off", placeholder="Search albums...", v-autofocus="true")
      ul.mt0.mb0.list-reset
        li.my1.h5.rounded.bg-lightest-green.flex.justify-between.py2.px1.border.border-transparent.pointer.hover-border-green.hover-opacity-100(v-for="(album, i) in $store.state.albums", @click.stop="select = i", :class="{'border-green': select === i, 'opacity-50': select !== i && select !== null}")
          h5.col-6.px1.truncate.left-align.font-exp {{album.name}}
          h6.col-6.px1.truncate.right-align [username]
      footer.sticky.mt3.bottom-0.left-0.col-12.center
        button.inline-block.py2.px3.border.rounded-2.bg-green.white.pointer(:disabled="select === null", :class="{'pointer': select !== null}") Confirm
</template>

<script>
import Modal from './Modal'
export default {
  name: 'AddCloverToAlbumModal',
  data () {
    return {
      query: '',
      select: null
    }
  },
  methods: {
  },
  components: { Modal }
}
</script>

<style>
</style>
