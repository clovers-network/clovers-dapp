<template lang="pug">
 section.h5(:class="{ hide: hideme }")
  .max-width-4.flex.justify-center.mx-auto.green.align-middle
     a.p2.flex.align-middle(target="_blank" href="https://github.com/clovers-network")
      GithubIcon(:width="20")
      .ml1.xs-hide.opacity-75.hover-opacity-100 Github
     a.p2.flex.align-middle(target="_blank" href="https://forum.clovers.network")
      DiscourseIcon(:width="20")
      .ml1.xs-hide.opacity-75.hover-opacity-100 Discourse
     a.p2.flex.align-middle(target="_blank" href="https://twitter.com/cloversnetwork")
      TwitterIcon(:width="20")
      .ml1.xs-hide.opacity-75.hover-opacity-100 Twitter
     a.p2.flex.align-middle(target="_blank" href="https://t.me/cloversnetwork")
      TelegramIcon(:width="20")
      .ml1.xs-hide.opacity-75.hover-opacity-100 Telegram

</template>

<script>
import GithubIcon from '@/components/Icons/GithubIcon'
import DiscourseIcon from '@/components/Icons/DiscourseIcon'
import TelegramIcon from '@/components/Icons/TelegramIcon'
import TwitterIcon from '@/components/Icons/TwitterIcon'
export default {
  name: 'Foot',
  computed: {
    hideme () {
      const rt = this.$route
      return rt.name === 'Clover' || rt.meta.isOverlay || rt.name === 'Garden'
    }
  },
  components: {
    GithubIcon,
    DiscourseIcon,
    TwitterIcon,
    TelegramIcon
  }
}
</script>
