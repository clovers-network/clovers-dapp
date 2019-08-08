<template>
  <svg
    :width="size + 'px'"
    :height="size + 'px'"
    viewBox="0 0 34 34"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <g
      stroke="none"
      stroke-width="3"
      fill="none"
      fill-rule="evenodd">
      <g transform="translate(-356.000000, -202.000000)">
        <g transform="translate(356.000000, 202.000000)">
          <path
            :width="size + 'px'"
            :stroke="color"
            :fill="invert? '#01B463' : '#00b4641a'"
            d="M10.9658528,31.596894 C8.42415626,33.4478439 5.76887201,33.5822126 3,32 C4.57498093,31.6062548 5.82024936,30.6743488 6.7358053,29.2042822 C3.01589907,26.274559 0.627416998,21.7299179 0.627416998,16.627417 C0.627416998,7.790861 7.790861,0.627416998 16.627417,0.627416998 C25.463973,0.627416998 32.627417,7.790861 32.627417,16.627417 C32.627417,25.463973 25.463973,32.627417 16.627417,32.627417 C14.6340848,32.627417 12.7258895,32.2629022 10.9658528,31.596894 Z"
            stroke-width="2"/>
          <text
            v-if="!blank"
            :fill="invert ? '#fff' : color"
            opacity="0.98999995"
            font-family="Helvetica"
            font-size="11"
            font-weight="normal"
            text-anchor="middle">
            <tspan
              x="16.5"
              y="21">{{ displayCount }}</tspan>
          </text>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'ChatIcon',
  props: {
    color: {
      type: String,
      default: '#01B463'
    },
    blank: {
      type: Boolean,
      default: false
    },
    count: Number,
    invert: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number,
      default: 32
    }
  },
  computed: {
    displayCount () {
      const val = this.count
      if (!val) return 0
      if (val < 1000) return val
      if (val < 1000000) return `${(val / 1000).toFixed(0)}K`
      return `${(val / 1000000).toFixed(0)}M`
    }
  }
}
</script>
