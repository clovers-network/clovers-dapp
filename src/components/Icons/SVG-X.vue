<template lang="pug">
svg.block
  line(x1="0", y1="0", x2="100%", y2="100%", stroke="currentColor", :stroke-width="`${thickness}px`")
  line(x1="0", y1="100%", x2="100%", y2="0%", stroke="currentColor", :stroke-width="`${thickness}px`")
</template>

<script>
export default {
  name: 'SVGX',
  props: {
    thickness: { type: String, default: '1' }
  }
}
</script>
