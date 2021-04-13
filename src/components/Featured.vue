<template lang="pug">
  aside.mxn3.md-mt3.py3.px2.md-border-dashed.md-shadow.flex.flex-wrap.justify-between.rounded(style="margin-bottom:-1rem", v-if="albums.length")
    header.col-12.md-col-3.px1.md-px2.pb2
      h3.h2.md-h3.font-exp Spotlight&nbsp;✨
      //- album-list-cards.mt2(v-if="albums.length", :albums="albums")
    router-link.block.my1.col-6.sm-col-4.md-col-3.px1.sm-px2(v-for="(albm, i) in albums", :to="{name: 'Album', params: {id: albm.id}}", :key="albm", :class="{'hidden sm-block': i > 1}")
      album-item-card(:album="albm")
</template>

<script>
import { mapState } from 'vuex'
import AlbumListCards from '@/components/AlbumList--Cards'
import AlbumItemCard from '@/components/AlbumItem--Card'
export default {
  name: 'Featured',
  data () {
    return {
      ftAlbums: process.env.VUE_APP_FEATURED_ALBUMS || ''
    }
  },
  computed: {
    ...mapState({ albums: 'featuredAlbums' })
  },
  methods: {
    fetchAlbums () {
      if (this.albums.length) return
      const albms = this.ftAlbums.split(',')
      albms.forEach(id => {
        this.$store.dispatch('getAlbum', id).then(album => {
          this.$store.commit('ADD_FT_ALBUM', album)
        })
      })
    }
  },
  created () {
    // this.fetchAlbums()
  },
  components: { AlbumListCards, AlbumItemCard }
}
</script>

<style>
</style>
