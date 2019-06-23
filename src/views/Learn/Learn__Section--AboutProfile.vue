<template lang="pug">
  about(v-on="$listeners")
    h3(slot="header") Once claimed, they’ll appear on your public <b>Profile</b>
    img.block(slot="graphic", src="./imgs/profile.svg", style="height:70vh;max-height:80vw;max-width:none")
</template>

<script>
import About from './Learn__Section--AboutACloverPage'
export default {
  name: 'Learn__Section--AboutProfile',
  components: { About }
}
</script>

<style>
</style>
