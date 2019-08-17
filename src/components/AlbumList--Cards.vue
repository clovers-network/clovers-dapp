<template lang="pug">
  section.flex.flex-wrap.my0.mxn2
    .px1.mb2.sm-px2.sm-mb3.col-6.sm-col-4.lg-col-3(v-for="(album, i) in albums", v-if="!limit || (limit && i < limit)")
      router-link.block(:to="{name: 'Album', params: {id: album.id}}")
        album-item-card(:album="album")
    //- new album card-btn
    .px1.mb2.sm-px2.sm-mb3.col-6.sm-col-4.lg-col-3.flex(v-if="newBtn && (!limit || (limit && albums.length < limit))")
      button.pointer.col-12.rounded.flex.items-center.justify-center.h00.bg-lightest-green.border.border-transparent.hover-border-green(@click="newAlbum = true", aria-label="Create New Album")
        svg-plus(style="width:22px;height:22px", thickness="2")
    //- modal: new album
    transition(name="fade")
      add-album-modal(v-show="newAlbum", @close="newAlbum = false")
</template>

<script>
import AlbumItemCard from '@/components/AlbumItem--Card'
import svgPlus from '@/components/Icons/SVG-Plus'
import AddAlbumModal from '@/components/Modals/AddAlbumModal'
export default {
  name: 'AlbumList--Cards',
  props: ['albums', 'limit', 'newBtn'],
  data () {
    return {
      newAlbum: false
    }
  },
  components: { AlbumItemCard, svgPlus, AddAlbumModal }
}
</script>

<style>
</style>
