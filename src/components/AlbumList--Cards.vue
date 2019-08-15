<template lang="pug">
  section.flex.flex-wrap.my0.mxn2
    .px1.mb2.sm-px2.sm-mb3.col-6.sm-col-4.lg-col-3(v-for="(album, i) in albums", v-if="!limit || (limit && i < limit)")
      router-link.block(:to="{name: 'Album', params: {id: album.id}}")
        album-item-card(:album="album")
</template>

<script>
import AlbumItemCard from '@/components/AlbumItem--Card'
export default {
  name: 'AlbumList--Cards',
  props: ['albums', 'limit'],
  components: { AlbumItemCard }
}
</script>

<style>
</style>
