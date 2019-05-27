<template lang="pug">
  .absolute.w-100.bottom-0.left-0.flex.justify-center.pb2
    button.block.p2.pointer(@click="$emit('next')")
      img(src="./learn-icon-arrow-down.svg")
</template>

<script>
export default {
  name: 'Learn__DownArrowBtn'
}
</script>

<style>
</style>
