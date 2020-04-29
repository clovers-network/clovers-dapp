<template lang="pug">
  article.mt3.md-my4.pb4
    header.col-12.px1.sm-px2.md-px1.mb2.flex
      //- title card
      .relative.mx1.px2.pt2.pb2.col-12.clover-item-border.rounded.flex.flex-column.justify-between
        h1.col-12.h2.font-exp.mt1.px1.pb2(style="min-height:4.5em") {{album.name}}
        small.block.col-12.flex.items-end.sm-items-end.justify-between.sm-p1.pr1
          h6.col-9
            //- span.h6.sm-h5.mr2 Editor &nbsp;&rarr;
            //- owner
            router-link.h5.mr1.mt1.inline-block.px2.py1.bg-lightest-green.rounded.border.border-transparent.hover-bg-m-green(:to="{name: 'User', params: {addr: album.userAddress}}") {{_userName}}
            //- editors
            router-link.h5.mr1.mt1.inline-block.px2.py1.bg-lightest-green.rounded.border.border-transparent.hover-bg-m-green(v-for="editor in album.editorsData", :to="{name: 'User', params: {addr: editor.address}}") {{editor.name}}
          h6.h5.sm-h4.flex.items-center.pt1
            | {{album.clovers && album.clovers.length}}
            img.block.ml1(src="@/assets/icons/clover-icon-1.svg", style="width:0.875em;")
        //- edit btn
        button.absolute.top-0.right-0.p2.block.h4.pointer(v-if="isEditor", @click="showEdit" style="transform:scale(-1, 1)", aria-label="Edit Album") ✎
    //- clovers
    section.px1.flex.flex-wrap
      //- item
      .col-4.sm-col-4.md-col-3.lg-w-20.sm-px1.sm-my1(v-for="clover in album.clovers", :key="clover")
        //- border
        article.album__clover.block.pb-100.relative.border-transparent.border-dashed.hover-border-green.hover-shadow.trans-quick.rounded
          router-link.absolute.overlay.flex.items-center.justify-center(:to="{name: 'Clover', params: {board: clover}}")
            clv-svg.col-8.sm-col-9(:byteBoard="clover", :size="196")
          //- rmv btn
          button.absolute.top-0.right-0.m1.border.rounded-full.bg-lightest-green.pointer.trans-quick.opacity-50(style="padding:0.4rem", v-if="isOwner" @click="removeClover(clover)")
            svg-x(style="width:0.6rem;height:0.6rem")

    //- modal: edit album
    transition(name="fade")
      modal.green(v-show="edit", @close="edit = false", :cancel="true")
        .pt4.px3.pb3.center
          h3.hide Edit Album
          //- edit name
          form.px2.mb4(@submit.prevent="submitNewName")
            label.block.mb3.h4.font-exp.lh1 Album Name
            input.border.py2.px2.rounded.col-12.input.center(v-model="newName", name="clover-album-name", type="text", autocomplete="off", placeholder="Album Name", v-autofocus="true", required)
            button.mt3.inline-block.h4.pointer.py2.px3.rounded.bg-green.white(type="submit", :disabled="newName === album.name") Update
          //- edit editors
          .mb3.px2.pb1
            h4.h4.font-exp.lh1.mb3 Editors
            //- list
            ul.list-reset.m0
              li.my1.relative.rounded(v-for="editor in album.editorsData")
                router-link.block.py2.bg-lightest-green.rounded.truncate.lh2.hover-bg-m-green(:to="{name: 'User', params: {addr: editor.address}}")
                  | {{editor.name}}
                button.absolute.top-0.right-0.h-100.px2.flex.items-center.justify-center.pointer(aria-label="Remove Editor")
                  svg-x(style="width:1rem;height:1rem")
            //- add
            form.my1(v-if="isOwner && editors.length < 4", @submit.prevent="addEditor")
              label.hide Add Editor
              input.border-dashed.focus-border.py2.rounded.col-12.input.center(v-model="newEditor", name="clover-album-editor", type="text", autocomplete="off", placeholder="Add Editor")
              button.mt3.inline-block.h4.pointer.py2.px3.rounded.bg-green.white(type="submit", :disabled="!validEditor", v-show="newEditor.length") Add
          //- delete
          .mt4.relative.rounded.red.px2.py3(v-if="isOwner")
            .absolute.bg-red.opacity-25.overlay.rounded
            .relative.z1
              //- .h4.h4.mb2.font-exp Delete Album
              button.inline-block.h4.pointer.py2.px3.rounded.bg-red.white(@click="_deleteAlbum") Delete Album

</template>

<script>
import store from '@/store'
import { cloverImage, abbrvAddr } from '@/utils'
import Modal from '@/components/Modals/Modal'
import ClvSvg from '@/components/Clv--SVG'
import svgX from '@/components/Icons/SVG-X'
import {mapState, mapGetters, mapActions} from 'vuex'
import utils from 'web3-utils'
export default {
  name: 'Album',
  props: ['id'],
  data () {
    return {
      edit: false,
      newName: '',
      // editors: ['0xfa398d672936dcf428116f687244034961545d91', '0x0932b1b3bf422f406753324f424af7103525625f'],
      newEditor: ''
    }
  },
  computed: {
    ...mapGetters(['userName']),
    ...mapState(['account']),
    album () {
      return this.$store.state.currentAlbum
    },
    isOwner () {
      return this.account && this.account === this.album.userAddress
    },
    editors () {
      return this.album.editors || []
    },
    isEditor () {
      return this.isOwner || this.editors.includes(this.account)
    },
    _userName () {
      return this.album && this.userName(this.album.user)
    },
    validEditor () {
      return utils.isAddress(this.newEditor)
    }
  },
  beforeRouteEnter (to, from, next) {
    const { id } = to.params
    store.dispatch('getAlbum', id).then(next)
  },
  beforeRouteUpdate (to, from, next) {
    const { id } = to.params
    store.dispatch('getAlbum', id).then(next)
  },
  methods: {
    ...mapActions(['updateAlbum', 'deleteAlbum']),
    cloverImage,
    abbrvAddr,
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
      let yes = window.confirm('Are you sure you want to remove this Clover? This action cannot be undone...')
      if (yes) {
        console.log(`DELETE ${clover}`)
        let album = JSON.parse(JSON.stringify(this.album))
        console.log(album.clovers)
        let cloverIndex = album.clovers.indexOf(clover)
        console.log({cloverIndex})
        if (cloverIndex > -1) {
          album.clovers.splice(cloverIndex, 1)
          this.updateAlbum(album)
        } else {
          console.error(`couldn't find clover ${clover} in album`)
          console.log(album.clovers)
        }
      }
    },
    addEditor () {
      if (this.editors.includes(this.newEditor)) return alert('Editor already added.')
      const album = JSON.parse(JSON.stringify(this.album))
      album.editors = album.editors || []
      album.editors.push(this.newEditor)
      this.updateAlbum(album).then(() => { this.newEditor = '' })
    }
  },
  components: { svgX, Modal, ClvSvg }
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
