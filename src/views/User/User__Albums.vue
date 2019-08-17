<template lang="pug">
  section.mx3.md-mx0(v-if="userAlbums")
    header.hidden.md-block.h-select.py1.mb2.content-box
    album-list-cards(:albums="userAlbums", :newBtn="isOwner")
</template>

<script>
import AlbumListCards from '@/components/AlbumList--Cards'
export default {
  name: 'User__Albums',
  props: ['user'],
  computed: {
    userAlbums () {
      return this.user && this.$store.state.allAlbums.filter(albm => albm.userAddress === this.user.address)
    },
    isOwner () {
      return this.$route.params.addr === this.$store.getters.user.address
    }
  },
  created () {
    this.$store.dispatch('getAllAlbums')
  },
  components: { AlbumListCards }
}
</script>

<style>
</style>
