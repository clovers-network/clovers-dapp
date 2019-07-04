<template lang="pug">
  about(v-on="$listeners")
    h3(slot="header") Add favorites to your <b>Basket</b>
    img.block(slot="graphic", src="./imgs/favorites.svg", style="height:70vh;max-height:75vw;max-width:none")
</template>

<script>
import About from './Learn__Section--AboutACloverPage'
export default {
  name: 'LearnSectionAboutGarden',
  components: { About }
}
</script>

<style>
</style>
