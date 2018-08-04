<template>
  <button class="block border pointer m-auto"
    :class="'bg-dots-' + bg"
    @click="$emit('click')">
      <div class="block font-ext h2 m-auto border p2 px3"
        :class="['bg-' + bg, text, 'border-' + bg]">
        {{label}}</div>
  </button>
</template>

<script>
export default {
  name: 'DotBtn',
  props: {
    active: { type: Boolean, default: false },
    label: { type: String, default: () => 'Ok' },
    theme: { type: String, default: 'white' },
    bg: { type: String, default: 'green' },
    text: { type: String, default: 'white' }
  }
}
</script>

<style scoped>
button {
  max-width: 36rem;
  transform: translateX(-3px);
  > div {
    transform: translate(6px, -6px);
    transition: transform 0.15s ease-out;
    &:hover {
      transform: translate(8px, -8px);
    }
  }
}
</style>
