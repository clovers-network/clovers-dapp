<template lang="pug">
  about(v-on="$listeners")
    h3(slot="header") Visit your <b>Garden</b> to find more clovers. <br class="hide sm-show">It seeds new clovers as you scroll...
    img.block(slot="graphic", src="./imgs/garden.svg", style="height:70vh;max-height:80vw;max-width:none")
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
