<template>
  <div class="absolute text-path">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600">
      <path
        id="circle"
        fill="transparent"
        d="M123.71,122.73A249.21,249.21,0,0,1,300,50c138.07,0,250,111.93,250,250S438.07,550,300,550,50,438.07,50,300c0-68.75,25.4-128.62,70.31-173.81"/>
      <text
        width="600"
        :fill="fill"
        font-size="1.3em">
        <textPath xlink:href="#circle">{{ displayString }}</textPath>
      </text>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'SvgText',
  props: {
    moveString: String,
    animation: {
      type: Boolean,
      default: false
    },
    fill: {
      type: String,
      default: 'white'
    }
  },
  data () {
    return {
      stringList: [],
      animString: ''
    }
  },
  computed: {
    displayString () {
      return this.animation ? this.animString : this.moveString
    }
  },
  methods: {
    start () {
      let tmpMoves = this.moveString
      this.animString = ''
      while (tmpMoves.length) {
        this.stringList.push(tmpMoves.substring(0, 2))
        tmpMoves = tmpMoves.substring(2)
      }
      this.cycle()
    },
    cycle () {
      if (this.stringList.length) {
        this.animString += this.stringList.shift()
        setTimeout(() => {
          this.cycle()
        }, 20)
      }
    },
    stop () {
      this.stringList = []
      this.animString = ''
    }
  },
  watch: {
    moveString () {
      if (!this.animation) return
      this.stop()
      setTimeout(() => {
        this.start()
      }, 20)
    }
  },
  mounted () {
    this.start()
  }
}
</script>

<style>
.text-path {
  bottom: -2em;
  left: -2em;
  right: -2em;
  top: -2em;
  font-size: 1rem;
  textPath {
    font-family: monospace;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }
}
</style>
