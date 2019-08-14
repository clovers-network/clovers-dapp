<template lang="pug">
  section.flex.flex-wrap.my0.mxn2
    .px1.mb2.sm-px2.sm-mb3.col-6.sm-col-4.lg-col-3(v-for="albm in albums")
      album-item-card(:album="albm")
</template>

<script>
import AlbumItemCard from '@/components/AlbumItem--Card'
export default {
  name: 'AlbumList--Cards',
  props: ['albums'],
  components: { AlbumItemCard }
}
</script>

<style>
</style>
