<template lang="pug">
  article#learn.fixed.top-0.left-0.right-0.bottom-0.bg-white.overflow-y-scroll.touch-scroll(ref="body", style="z-index: 90")
    #learn_index_0.relative(, :style="slideStyle")
      nav.absolute.z2.top-0.left-0.p3.col-12
        button.pointer.border-dashed.green.bg-white.md-bg-green.md-white.md-border-none.rounded.p2.px3.lh1.h5.m1.sm-m2(@click="skip") Skip
      intro(@next="next(1)")
    #learn_index_1.relative(v-if="index > 0", :style="slideStyle")
      create-clovers(:clovers="clovers", @addClover="addClover", @next="next(2)")
    #learn_index_2.relative(v-if="index > 1", :style="slideStyle")
      symm-clovers(@next="next(3)")
    #learn_index_3.relative(v-if="index > 2", :style="slideStyle")
      about-regis(:clovers="clovers", :visible="index === 3", @next="next(4)")
    #learn_index_4.relative(v-if="index > 3", :style="slideStyle")
      about-profile(@next="next(5)")
    #learn_index_5.relative(v-if="index > 4", :style="slideStyle")
      about-market(@next="next(6)")
    #learn_index_6.relative(v-if="index > 5", :style="slideStyle")
      about-garden(@next="next(7)")
    #learn_index_7.relative(v-if="index > 6", :style="slideStyle")
      about-basket(@next="next(8)")
    #learn_index_8.relative(v-if="index > 7", :style="slideStyle")
      about-pig(@next="next(9)")
    #learn_index_9.relative(v-if="index > 8", :style="slideStyle")
      end
</template>

<script>
import Intro from './Learn__Section--Intro'
import CreateClovers from './Learn__Section--CreateClovers'
import SymmClovers from './Learn__Section--SymmClovers'
import AboutRegis from './Learn__Section--AboutRegistration'
import AboutProfile from './Learn__Section--AboutProfile'
import AboutMarket from './Learn__Section--AboutMarket'
import AboutGarden from './Learn__Section--AboutGarden'
import AboutBasket from './Learn__Section--AboutBasket'
import AboutPig from './Learn__Section--AboutPig'
import End from './Learn__Section--End'
export default {
  name: 'Learn',
  components: {
    Intro,
    CreateClovers,
    SymmClovers,
    AboutRegis,
    AboutProfile,
    AboutMarket,
    AboutGarden,
    AboutBasket,
    AboutPig,
    End
  },
  data () {
    return {
      index: 0,
      clovers: [],
      winH: window.innerHeight,
      afterResize: null
    }
  },
  computed: {
    slideStyle () {
      return {
        height: `${this.winH}px`
      }
    }
  },
  methods: {
    next (to) {
      this.index++
      this.$nextTick(() => this.$scrollTo('#learn_index_' + to, 600, { container: '#learn' }))
    },
    addClover (clvr) {
      this.clovers.push(clvr)
      this.$store.commit('SAVE_CLOVER', clvr)
    },
    skip () {
      this.$router.push({ name: 'Feed' })
    },
    onResize () {
      clearTimeout(this.afterResize)
      this.afterResize = setTimeout(() => {
        this.winH = window.innerHeight
      }, 150)
    }
  },
  beforeRouteEnter (to, from, next) {
    window.scroll(0, 0)
    next()
  },
  mounted () {
    window.addEventListener('resize', this.onResize)
  },
  destroyed () {
    window.removeEventListener('resize', this.onResize)
  }
}

</script>

<style>
</style>
