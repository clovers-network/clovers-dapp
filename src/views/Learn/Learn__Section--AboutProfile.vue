<template lang="pug">
  about(v-on="$listeners")
    h3(slot="header") Once registerd, it'll appear on your&nbsp;public <b>Profile</b>
    img.block(slot="graphic", src="./imgs/profile.svg", style="height:70vh;max-height:80vw;max-width:none")
</template>

<script>
import About from './Learn__Section--AboutACloverPage'
export default {
  name: 'LearnSectionAboutProfile',
  components: { About }
}
</script>

<style>
</style>
