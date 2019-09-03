<template>
  <article
    :style="{'padding-top': (market === 'ClubToken' ? 'calc(100vh - 737px)' : 'calc(100vh - 900px)')}"
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
      // options: {
      //   responsive: true,
      //   maintainAspectRatio: false,
      //   responsiveAnimationDuration: 300,
      //   legend: { display: false },
      //   title: { display: false },
      //   scales: {
      //     yAxes: [
      //       {
      //         display: false,
      //         ticks: {
      //           suggestedMin: 0.0015,
      //           max: 0.0024
      //         }
      //       }
      //     ],
      //     xAxes: [
      //       {
      //         // type: 'time',
      //         display: false,
      //         ticks: {
      //           suggestedMin: this.orders.length && this.orders[this.orders.length - 1].created,
      //           max: this.orders.length && this.orders[0].created,
      //         }
      //       }
      //     ]
      //   }
      // }
    }
  },
  computed: {
    options () {
      return {
        responsive: true,
        maintainAspectRatio: false,
        responsiveAnimationDuration: 300,
        legend: { display: false },
        title: { display: false },
        scales: {
          yAxes: [
            {
              display: false,
              ticks: {
                suggestedMin: 0.0015,
                max: 0.0024
              }
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
    },
    chartData () {
      return {
        datasets: [
          {
            label: 'Price',
            backgroundColor: 'white',
            borderColor: '#00b464',
            fill: 'end',
            borderWidth: 1,
            pointRadius: 1,
            lineTension: 0,
            data: this.orders.map((p, i) => {
              return {
                y: parseFloat(new BigNumber(p.value)
                  .div(new BigNumber(p.tokens))
                  .toFixed(6)),
                x: new Date((((parseInt(p.created) - 8363701) * 15) + 1565944718) * 1000)
                // x: this.orders.length - i
                // x: p.created
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
