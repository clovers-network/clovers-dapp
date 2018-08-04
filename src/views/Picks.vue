<template>
  <div>
    <ul class="list-reset flex flex-wrap">
      <li v-for="(clover, i) in picks" :key="i" class="pr4 pb4">
        <img :src="cloverImage(clover)"/>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { cloverImage } from '@/utils'

export default {
  name: 'Picks',
  computed: {
    ...mapGetters(['picks', 'pickCount'])
  },
  methods: {
    cloverImage
  }
}
</script>
