<template lang="pug">
  learn-frame
    img.absolute.top-0.left-0.h-100.w-100(src="./learn-bg-clovers.svg", style="object-fit:cover")
    header.absolute.overlay.flex.items-center.justify-center
      h3.h3.font-exp Have fun !
      //- h3.h3 Now get started and have fun...
        ul.list-reset
          li
            cart-icon.inline.mr1
            .inline Collecting Clovers
          li
            coin-icon.inline-block.mr1
            .inline Earning Clover Coin
          li
            person-icon.inline.mr1
            .inline and growing the Clovers Network
    footer.absolute.bottom-0.left-0.w-100.center.px3(style='padding-bottom:18vh')
      .inline-block.m1
        router-link.border.rounded.h4.font-ext.flex.items-center.justify-center.hover-bg-l-green(:to="{name: 'Garden'}", style="width:14em; height:2.7em") Go to Garden
      .inline-block.m1
        router-link.border.rounded.h4.font-ext.flex.items-center.justify-center.hover-bg-l-green(:to="{name: 'Picks'}", style="width:14em; height:2.7em") View your Clovers
</template>

<script>
import LearnFrame from './Learn__Section__Frame'
import DownArrowBtn from './Learn__DownArrowBtn'
import CartIcon from '@/components/Icons/CartIcon'
import CoinIcon from '@/components/Icons/CoinIcon'
import PersonIcon from '@/components/Icons/PersonIcon'
export default {
  name: 'LearnSectionEnd',
  components: {
    LearnFrame,
    DownArrowBtn,
    CartIcon,
    CoinIcon,
    PersonIcon
  },
  mounted () {
    updateLocal()
  }
}

function updateLocal (key = 'first-visit', value = true) {
  if (!window.localStorage) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

</script>

<style scoped>
@import '../../style/settings';
@media (--breakpoint-xs) {
  img{
    object-position: 35% top;
  }
}
</style>
