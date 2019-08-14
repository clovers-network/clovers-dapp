<template lang="pug">
  album-pages.mx3.md-mx0(v-if="user", :apiPath="`/users/${user.address}/albums`")
</template>

<script>
import AlbumPages from '@/components/AlbumPages'
export default {
  name: 'User__Albums',
  props: ['user'],
  components: { AlbumPages }
}
</script>

<style>
</style>
