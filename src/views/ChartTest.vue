<template>
  <article><price-chart
    :data="chartData"
    :options="{responsive: false, maintainAspectRatio: false}"
    :width="400"
    :height="200"></price-chart>
  </article>
</template>

<script>
import PriceChart from '@/components/PriceChart'
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
export default {
  name: 'ChartTest',

  data () {
    return {
      chartData: {
        labels: ['January', 'February'],
        datasets: [
          {
            label: 'GitHub Commits',
            backgroundColor: '#f87979',
            data: [40, 20]
          }
        ]
      }
    }
  },
  computed: {
    ...mapState(['']),
    ...mapGetters([''])
  },
  methods: {
    ...mapActions(['getOrders']),
    ...mapMutations([''])
  },
  mounted () {
    this.getOrders()
  },
  destroyed () {},
  components: { PriceChart }
}
</script>

<style lang="scss">
</style>
