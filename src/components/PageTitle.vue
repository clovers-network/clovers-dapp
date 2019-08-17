<template lang="pug">
  .mt3.sm-mt4.mxn2
    more-information.mx2(:btn="false", :parentShow="info")
      slot(name="info")
    .flex.items-center.px1.sm-px2.lh1
      .font-exp(style="font-size:2.25em")
        slot
      button.pointer.font-reg.rounded-full.bg-lightest-green.lh1.flex.items-center.justify-center.opacity-75.hover-opacity-100(style="width:1.4em; height:1.4em; font-size:10.5px; margin-top:0.1em; padding-bottom:0.05em; margin-left:1.66em", @click="info = !info", title="More Info") ?

</template>

<script>
import MoreInformation from '@/components/MoreInformation'
export default {
  name: 'PageTitle',
  data () {
    return {
      info: false
    }
  },
  components: { MoreInformation }
}
</script>

<style>
</style>
