<template lang="pug">
 .bg-green(:class="{ hide: hideme }")
  .max-width-4.flex.justify-center.mx-auto.white.align-middle
     a.p2.flex.align-middle(target="_blank" href="https://github.com/clovers-network")
      GithubIcon
      .ml1.xs-hide Github
     a.p2.flex.align-middle(target="_blank" href="https://forum.clovers.network")
      DiscourseIcon
      .ml1.xs-hide Discourse
     a.p2.flex.align-middle(target="_blank" href="https://twitter.com/cloversnetwork")
      TwitterIcon
      .ml1.xs-hide Twitter
     a.p2.flex.align-middle(target="_blank" href="https://t.me/cloversnetwork")
      TelegramIcon
      .ml1.xs-hide Telegram

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
      return this.$route.name === 'Clover'
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
