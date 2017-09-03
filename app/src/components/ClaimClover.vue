<template>
  <div class="bg-dark-gray white px2 py3">
    <div class="flex items-center justify-between">
      <div class="relative">
        <div class="h2">
          <clv :board="miner.byteBoardToRowArray(clover.byteBoard)"></clv>
        </div>
        <div>
          <svg-text :movesString="clover.movesString"></svg-text>
        </div>
      </div>
      <div class="">

      </div>
    </div>
  </div>
</template>

<script>
  import SvgText from '@/components/TextPath'

  export default {
    name: 'claim-clover',
    props: {
      clover: {
        type: Object,
        required: true
      },
      miner: {
        type: Object,
        required: true
      }
    },
    components: { SvgText }
  }
</script>
