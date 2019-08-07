<template lang="pug">
  about(v-on="$listeners")
    h3(slot="header") Or use the clover <b>Pig!</b><br>It sniffs-out rare clovers in the background
    img.block(slot="graphic", src="./imgs/pig.svg", style="height:70vh;max-height:80vw;max-width:none")
</template>

<script>
import About from './Learn__Section--AboutACloverPage'
export default {
  name: 'LearnSectionAboutPig',
  components: { About }
}
</script>

<style>
</style>
