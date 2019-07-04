<template lang="pug">
  about(v-on="$listeners")
    h3(slot="header") To find more, visit your <b>Garden</b><br class="hide sm-show">It seeds new clovers as you scroll
    img.block(slot="graphic", src="./imgs/garden.svg", style="height:70vh;max-height:80vw;max-width:none")
</template>

<script>
import About from './Learn__Section--AboutACloverPage'
export default {
  name: 'Learn__Section--AboutGarden',
  components: { About }
}
</script>

<style>
</style>
