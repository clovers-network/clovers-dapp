<template lang="pug">
  aside.mxn3.md-mt3.py3.px2.md-border.md-shadow.flex.flex-wrap.justify-between.rounded(style="margin-bottom:-1rem")
    header.col-12.md-col-3.px1.md-px2.pb2
      h3.h2.md-h3.font-exp Today ✨
      //- album-list-cards.mt2(v-if="albums.length", :albums="albums")
    router-link.block.my1.col-6.sm-col-4.md-col-3.px1.sm-px2(v-for="(albm, i) in albums", :to="{name: 'Album', params: {id: albm.id}}", :class="{'hidden sm-block': i > 1}")
      album-item-card.border(:album="albm")
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
