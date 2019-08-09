<template>
  <article
    :style="{'padding-top': (market === 'ClubToken' ? 'calc(100vh - 575px)' : 'calc(100vh - 900px)')}"
    class="relative minh-200">
    <price-chart
      :chart-data="chartData"
      :options="options"
      class="price-chart absolute left-0 right-0 bottom-0 bg-dots-green"/>
  </article>
</template>

<script>
import BigNumber from 'bignumber.js'
import PriceChart from '@/components/PriceChart'

export default {
  name: 'ChartTest',
  components: { PriceChart },
  props: {
    market: {
      type: String,
      default: 'ClubToken'
    },
    orders: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        responsiveAnimationDuration: 300,
        legend: { display: false },
        title: { display: false },
        scales: {
          yAxes: [
            {
              display: false
            }
          ],
          xAxes: [
            {
              type: 'time',
              display: false
            }
          ]
        }
      }
    }
  },
  computed: {
    chartData () {
      return {
        datasets: [
          {
            label: 'Clovers',
            backgroundColor: 'white',
            borderColor: '#00b464',
            fill: 'end',
            borderWidth: 1,
            pointRadius: 0,
            lineTension: 0,
            data: this.orders.map((p, i) => {
              return {
                y: new BigNumber(p.value)
                  .div(new BigNumber(p.tokens))
                  .toNumber(0),
                // x: parseInt(p.created)
                x: this.orders.length - i
              }
            })
          }
        ]
      }
    }
  }
}
</script>

<style lang="css" scoped>
  .price-chart {
    top: 2.5em;
  }
</style>
