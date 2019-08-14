<template lang="pug">
  modal.green(@close="$router.push({name: $route.name})")
    div test
</template>

<script>
import Modal from './Modal'
export default {
  name: 'AddAlbumModal',
  components: { Modal }
}
</script>

<style>
</style>
