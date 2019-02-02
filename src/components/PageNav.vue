<template>
  <nav v-if="nextRt || prevRt" class="flex justify-between items-center h5 green">
    <router-link :to="prevRt" v-if="prevRt" class="block col-6 flex-grow py4 flex">
      <span class="block m-auto">&larr; Previous</span>
    </router-link>
    <router-link :to="nextRt" v-if="nextRt" class="block col-6 flex-grow py4 flex">
      <span class="block m-auto">Next &rarr;</span>
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'PageNav',
  props: ['prevRt', 'nextRt']
}
</script>

<style>
</style>
