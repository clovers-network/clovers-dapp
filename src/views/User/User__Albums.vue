<template lang="pug">
  paged-albums.mx3.md-mx0(v-if="user", :apiPath="`/users/${user.address}/albums`")
</template>

<script>
import PagedAlbums from '@/components/PagedAlbums'
export default {
  name: 'User__Albums',
  props: ['user'],
  components: { PagedAlbums }
}
</script>

<style>
</style>
