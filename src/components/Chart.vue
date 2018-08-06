<template>
  <article class="relative" style="padding-top: 66%">
    <price-chart
      class="absolute top-0 left-0 right-0 bottom-0 bg-dots-green"
      :chart-data="chartData"
      :options="options"/>
  </article>
</template>

<script>
import BigNumber from 'bignumber.js'
import PriceChart from '@/components/PriceChart'

export default {
  name: 'ChartTest',
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
          yAxes: [{
            display: false
          }],
          xAxes: [{
            type: 'time',
            display: false
          }]
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
            data: this.orders.map((p) => {
              return {
                y: new BigNumber(p.tokens).div(new BigNumber(p.value)).toNumber(0),
                x: parseInt(p.created)
              }
            })
          }
        ]
      }
    }
  },
  components: { PriceChart }
}
</script>
