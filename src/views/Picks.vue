<template>
  <div class="p2 my4">
    <ul class="list-reset flex flex-wrap">
      <li v-for="clover in picks" class="pr4 pb4">
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
      ...mapGetters([
        'picks',
        'pickCount'
      ])
    },
    methods: {
      cloverImage
    }
  }
</script>
