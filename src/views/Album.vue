<template lang="pug">
  article.mt3.md-my4.pb4
    header.col-12.px1.sm-px2.md-px1.mb2.flex
      //- title card
      .relative.mx1.px2.pt2.pb2.col-12.clover-item-border.rounded.flex.flex-column.justify-between
        h1.col-12.h2.font-exp.mt1.px1.pb2(style="min-height:4.5em") {{album.name}}
        small.block.col-12.flex.items-center.sm-items-end.justify-between.sm-p1.pr1
          h6
            router-link.h5.mr2.inline-block.px2.py1.bg-lightest-green.rounded.border.border-transparent.hover-border-green(:to="{name: 'User', params: {addr: album.userAddress}}") {{_userName}}
            span.h6.sm-h5 &larr;&nbsp; Editor
          h6.h5.sm-h4.flex.items-center.pt1
            | {{album.clovers && album.clovers.length}}
            img.block.ml1(src="@/assets/icons/clover-icon-1.svg", style="width:0.875em;")
        //- edit btn
        button.absolute.top-0.right-0.p2.block.h4.pointer(v-if="isEditor", @click="showEdit" style="transform:scale(-1, 1)", aria-label="Edit Album") ✎
    //- clovers
    section.px1.flex.flex-wrap
      template(v-for="n in album.clovers")
        //- item
        .col-4.sm-col-4.md-col-3.lg-w-20.sm-px1.sm-my1(v-for="clover in album.clovers")
          //- border
          article.album__clover.block.pb-100.relative.border-transparent.border-dashed.hover-border-green.hover-shadow.trans-quick.rounded
            router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'Clover', params: {board: clover}}")
              img.block.col-8.sm-col-9(:src="cloverImage(clover, 128)")
            //- TODO show for owner !!
            button.absolute.top-0.right-0.m1.border.rounded-full.bg-lightest-green.pointer.trans-quick.opacity-50(style="padding:0.4rem", v-if="isEditor" @click="removeClover(clover)")
              svg-x(style="width:0.6rem;height:0.6rem")

    //- modal: edit album
    transition(name="fade")
      modal.green(v-show="edit", @close="edit = false", :cancel="true")
        .pt4.px3.pb3
          h3.hide Edit Album
          //- edit name
          form.px2.pb3.center(@submit.prevent="submitNewName")
            label.block.mb3.h4.font-exp.lh1 Edit Name
            input.center.border.py2.px2.rounded.col-12.input(v-model="newName", name="clover-album-name", type="text", autocomplete="off", placeholder="Album Name", v-autofocus="true", required)
            button.mt3.inline-block.font-ext.pointer.py2.px3.rounded.bg-green.white(type="submit", :disabled="newName === album.name") Update
          //- delete
          .mt4.relative.rounded.red.px2.py3.center
            .absolute.bg-red.opacity-25.overlay.rounded
            .relative.z1.center
              //- .h4.h4.mb2.font-exp Delete Album
              button.inline-block.font-ext.pointer.py2.px3.rounded.bg-red.white(@click="_deleteAlbum") Delete Album

</template>

<script>
import store from '@/store'
import { cloverImage } from '@/utils'
import Modal from '@/components/Modals/Modal'
import svgX from '@/components/Icons/SVG-X'
import {mapGetters, mapActions} from 'vuex'
export default {
  name: 'Album',
  props: ['id'],
  data () {
    return {
      edit: false,
      newName: ''
    }
  },
  computed: {
    ...mapGetters(['userName']),
    album () {
      return this.$store.state.currentAlbum
    },
    isEditor () {
      return true
    },
    _userName () {
      return this.album && this.userName(this.album.user)
    }
  },
  beforeRouteEnter (to, from, next) {
    const { id } = to.params
    store.dispatch('getAlbum', id).then(next)
  },
  methods: {
    ...mapActions(['updateAlbum', 'deleteAlbum']),
    cloverImage,
    showEdit () {
      this.newName = this.album.name
      this.edit = true
    },
    async submitNewName () {
      let albumCopy = JSON.parse(JSON.stringify(this.album))
      albumCopy.name = this.newName
      await this.updateAlbum(albumCopy)
      this.edit = false
    },
    async _deleteAlbum () {
      let yes = window.confirm('Are you sure you want to delete this Album? This action cannot be undone...')
      if (yes) {
        try {
          await this.deleteAlbum(this.album.id)
          this.$router.push('/albums')
        } catch (error) {
          console.error(error)
        }
      }
    },
    removeClover (clover) {
      console.log(`DELETE ${clover}`)
    }
  },
  components: { svgX, Modal }
}
</script>

<style>
@media (hover:hover) {
  .album__clover{
    & button{
      opacity:0;
    }
    &:hover button{
      opacity:1;
    }
  }
}
</style>
