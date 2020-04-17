<template lang="pug">
  //- aside.mt4
    h3.h3.font-exp Spotlight
    album-list-cards.mt3(v-if="albums.length", :albums="albums")
  //- aside.flex.justify-center.mt2.pb2
    .relative.bg-lightest-green(style="min-width:100vw; max-height:34rem; overflow: hidden;")
      .mx-auto.md-col-10.lg-col-8.py3.px2.md-px0
        h3.h3.font-exp Spotlight
        album-list-cards.mt2(v-if="albums.length", :albums="albums")
      .absolute.bottom-0.col-12.z1(style="height:3rem; background:linear-gradient(to top, white, transparent)")
  //- aside.flex.justify-center.mt3
    .px3(style="min-width:100vw")
      .mx-auto.md-col-10.border.border-dashed.shadow.rounded.p1.flex.items-center
        .col-6.px3
          h3.h3.font-exp Spotlight
        .col-6
          album-list-cards.mt2(v-if="albums.length", :albums="albums")
  aside.border-dashed.flex.rounded.py3.px2.mt3(style="margin-bottom:-1rem")
    .col-3.px2
      h3.h3.font-exp Spotlight
      //- album-list-cards.mt2(v-if="albums.length", :albums="albums")
    router-link.block.col-3.px2(v-for="albm in albums", :to="{name: 'Album', params: {id: albm.id}}")
      album-item-card(:album="albm")
</template>

<script>
import AlbumListCards from '@/components/AlbumList--Cards'
import AlbumItemCard from '@/components/AlbumItem--Card'
export default {
  name: 'Featured',
  data () {
    return {
      ftAlbums: [
        '38dcb59a-2bbc-4685-b1ea-267a09b6cf6d', // faces
        '247e93af-8213-4662-891b-12336956a8ae', // flowers
        'a2bf1419-71f7-4a04-8e2e-123e37939840' // send nudes
      ],
      albums: []
    }
  },
  methods: {
    fetchAlbums () {
      this.ftAlbums.forEach(id => {
        this.$store.dispatch('getAlbum', id).then(album => {
          console.log(album)
          this.albums.push(album)
        })
      })
    }
  },
  created () {
    this.fetchAlbums()
  },
  components: { AlbumListCards, AlbumItemCard }
}
</script>

<style>
</style>
