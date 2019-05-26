<template lang="pug">
  .inline-block.line-height-1.pointer(:class="{'opacity-100': active}", @click.prevent="$emit('click')")
    img(src="../../assets/icons/cart.svg")
</template>

<script>
export default {
  name: 'HeartIcon',
  props: {
    active: {type: Boolean, default: false}
  }
}
</script>
