<template lang="pug">
  article#learn.fixed.top-0.left-0.right-0.bottom-0.bg-white.overflow-y-scroll(ref="body", style="z-index: 90")
    #learn_index_0.h-100vh.relative
      intro(@next="next(1)")
    #learn_index_1.h-100vh.relative(v-if="index > 0")
      create-clovers(:clovers="clovers", @addClover="addClover", @next="next(2)")
    #learn_index_2.h-100vh.relative(v-if="index > 1")
      symm-clovers(@next="next(3)")
    #learn_index_3.h-100vh.relative(v-if="index > 2")
      about-regis(:clovers="clovers", :visible="index === 3", @next="next(4)")
    #learn_index_4.h-100vh.relative(v-if="index > 3")
      about-profile(@next="next(5)")
    #learn_index_5.h-100vh.relative(v-if="index > 4")
      about-market(@next="next(6)")
    #learn_index_6.h-100vh.relative(v-if="index > 5")
      about-garden(@next="next(7)")
    #learn_index_7.h-100vh.relative(v-if="index > 6")
      about-basket(@next="next(8)")
    #learn_index_8.h-100vh.relative(v-if="index > 7")
      about-pig(@next="next(9)")
    #learn_index_9.h-100vh.relative(v-if="index > 8")
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
      clovers: []
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
    }
  }
}
</script>

<style>
</style>
