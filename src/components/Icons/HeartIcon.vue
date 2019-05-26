<template lang="pug">
  .inline-block.line-height-1.pointer.h1(:class="{'opacity-30': !active}", @click.prevent="$emit('click')") &hearts;&#xfe0e;
</template>

<script>
export default {
  name: 'HeartIcon',
  props: {
    active: {type: Boolean, default: false}
  }
}
</script>

<style>
</style>
