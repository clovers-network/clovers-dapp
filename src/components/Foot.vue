<template lang="pug">
 .absolute.bottom-0.left-0.right-0.bg-green
  .max-width-4.flex.justify-center.mx-auto.white.align-middle
     a.p2.flex.align-middle(target="_blank" href="https://twitter.com/cloversnetwork")
      DiscourseIcon
      .ml1 Discourse
     a.p2.flex.align-middle(target="_blank" href="https://github.com/okwme/clovers-dapp")
      GithubIcon
      .ml1 Github
     a.p2.flex.align-middle(target="_blank" href="https://twitter.com/cloversnetwork")
      TelegramIcon
      .ml1 Telegram
     a.p2.flex.align-middle(target="_blank" href="https://twitter.com/cloversnetwork")
      TwitterIcon
      .ml1 Twitter

</template>

<script>
import GithubIcon from '@/components/Icons/GithubIcon'
import DiscourseIcon from '@/components/Icons/DiscourseIcon'
import TelegramIcon from '@/components/Icons/TelegramIcon'
import TwitterIcon from '@/components/Icons/TwitterIcon'
export default {
  name: 'Foot',

  data () {
    return {}
  },
  components: {
    GithubIcon,
    DiscourseIcon,
    TwitterIcon,
    TelegramIcon
  }
}
</script>
