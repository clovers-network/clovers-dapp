<template>
  <button class="block border col-12 pointer" :class="[theme, 'bg-dots-white']" @click="$emit('click')">
    <div class="col-6 bg-current-color trans-transform flex" :class="{'transl-x-100': active}">
      <div class="block font-ext h2 m-auto line-height-1" :class="theme === 'white' ? 'green' : theme">{{!active ? labels[1] : labels[0]}}</div>
    </div>
  </button>
</template>

<script>
export default {
  name: 'ToggleBtn',
  props: {
    active: { type: Boolean, default: false },
    labels: { type: Array, default: () => ['On', 'Off'] },
    theme: { type: String, default: 'white' }
  }
}
</script>

<style scoped>
button {
  max-width: 36rem;
  > div {
    height: 5rem;
    > div {
      padding-bottom: 0.1em;
    }
  }
}
</style>
