<template lang="pug">
  .absolute.w-100.bottom-0.left-0.pb2
    slot.mx-auto
    button.block.mt2.p2.pointer.mx-auto(@click="$emit('next')")
      img(src="./learn-icon-arrow-down.svg")
</template>

<script>
export default {
  name: 'Learn__DownArrowBtn'
}
</script>

<style>
</style>
