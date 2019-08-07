 <template lang="pug">
  header.sticky.top-0.z2(:class="{'bg-white green': !showMenu, 'white': showMenu}")
    //- top bar
    .relative.z2.h-header.flex.items-center.justify-between(:class="{'md-border-bottom': !showMenu}")
      //- left col
      .col-4.flex.pl2.items-center
        //- desktop menu
        #desktopMenu.flex.flex-center.ml3
          router-link.pr2(:to="{name: 'Account'}") Dashboard
          router-link.pr2(:to="{name: 'Feed'}") Feed
          router-link.pr2(:to="{name: 'Garden'}") Garden
          router-link.pr2(:to="{name: 'Learn'}") Learn
          router-link.pr2(:to="{name: 'Activity'}") Activity
        //- menu btn
        button#mobileMenu.menu-btn.pointer.relative.py2.pr2(@click='showMenu = !showMenu' aria-label='Toggle Menu')
          wavey-btn(v-show='mining', :is-white='showMenu')
          img.block(v-show='!mining', :src="showMenu\
            ? require('../assets/icons/hamburger-white.svg')\
            : require('../assets/icons/hamburger.svg')")
          span(@click.stop='')
            router-link(:to="{ name: 'Account' }")
              .found-badge.border.border-green.bounceIn.animated(v-if='showBadge')
                span.block
                  | {{ symms }}

      //- title
      h1.hidden.md-block.font-exp.h3.col-4.py1.center
        span.nowrap.pointer(@click='showMenu = showBackButton ? showMenu : !showMenu')
          | {{showMenu ? &apos;Clovers&apos; : $route.meta.title}}
      //- right col
      #accountHeader.col-4.flex.justify-end
        .border.rounded.flex.items-center.mr2.md-mr3
          //- btn: pig
          .relative.border-right.hidden.md-block
            .h-nav-btn.h6.md-h5.px2.flex.items-center.pointer.lh1(@click='pigMenuToggle')
              //- dot
              span.border.mr1.inline-block(style='border-radius:100%; width:13px; height:13px;')
                span.block(:class="mining && 'bg-currentColor throb'" style='border-radius:100%; width: 13px; height: 13px; margin-top: -1px; margin-left: -1px;')
              span PIG
            //- menu dropdown
            pig-menu(@closePigMenu="closePigMenu" v-click-outside="closePigMenu" v-if="pigMenu" )
          //- btn: picks
          router-link.h-nav-btn.h6.md-h5.px2.flex.items-center.pointer(:to="{name: 'Picks'}")
            cart-icon.mr1
            span {{pickCount}}
          //- btn: tokens
          router-link.h-nav-btn.h6.md-h5.flex.px1.items-center.border-left(:to="{name: 'Trade'}", v-show="prettyUserBalance !== '-'")
            coin-icon.mr1(style="padding-bottom:4px")
            span {{prettyUserBalance}}
          //- bnt: account
          .relative
            #personToggle.h-nav-btn.h6.md-h5.pl2.pr1.flex.items-center.pointer.border-left(@click="accountMenuToggle")
              person-icon(:class="!authHeader && 'red'")
              .chevron
            account-menu(@close-account-menu="closeAccountMenu" v-click-outside="closeAccountMenu" v-if="accountMenu")
    //- (mobile page title)
    h1.md-hide.h1.font-exp.mt3.pl2(v-if="$route.meta.title") {{$route.meta.title}}
    //- nav overlay
    .absolute.z1.h-100vh.col-12.bg-green.top-0.left-0.flex.flex-column.justify-between.center(v-show='showMenu')
      .h-header
      nav.flex-auto.flex.items-center.justify-center.pb1
        ul.h2.list-reset
          li
            router-link.inline-block.p1(:to="{ name: 'Welcome' }" exact) Welcome
          li
            router-link.inline-block.p1(:to="{name: 'Account'}") Dashboard
          li
            router-link.inline-block.p1(:to="{ name: 'Feed' }") Feed
          li
            router-link.inline-block.p1(:to="{ name: 'Garden' }") Garden
          li
            router-link.inline-block.p1(:to="{name: 'Learn'}") Learn
          li
            router-link.inline-block.p1.relative(:to="{ name: 'Activity' }")
              span Activity <sup v-if="newLogs">{{newLogs}}</sup>
              //- span.circle.bg-orange.absolute(v-if="newLogs" style="width:8px;height:8px")
      .border.rounded.m2
        pig.py3.mb1(@viewPicks="$router.push({name: 'Picks'})")
</template>

<script>
import ClickOutside from 'vue-click-outside'
import WaveyBtn from '@/components/Icons/WaveyMenu'
import AccountMenu from '@/components/AccountMenu'
import PigMenu from '@/components/PigMenu'
import Pig from '@/components/Pig'
import PersonIcon from '@/components/Icons/PersonIcon'
import CartIcon from '@/components/Icons/CartIcon'
import CoinIcon from '@/components/Icons/CoinIcon'
import {toDec} from '@/utils'
import {mapActions, mapGetters, mapState} from 'vuex'
export default {
  name: 'AppHeader',
  data () {
    return {
      showMenu: false,
      pigMenu: false,
      accountMenu: false,
      showBadge: false
    }
  },
  computed: {
    mining () {
      return this.miners.length > 0
    },
    title () {
      return this.$route.meta.title || 'Clovers'
    },
    symms () {
      return this.$store.state.miningStats.symms
    },
    newLogs () {
      return this.$store.state.logs.length
    },
    showBackButton () {
      return this.$route.name === 'Clover' &&
        this.$route.meta.fromName !== null
    },
    prettyUserBalance () {
      return this.user.address ? toDec(this.userBalance) : '-'
    },
    ...mapState(['miners']),
    ...mapGetters(['user', 'userBalance', 'pickCount', 'authHeader'])
  },
  watch: {
    '$route' () {
      this.showMenu = false
    },
    symms () {
      this.showBadge = true
    },
    showMenu () {
      this.showBadge = false
    }
  },
  mounted () {
    window.addEventListener('keyup', this.checkEsc)
    window.addEventListener('resize', () => { this.showMenu = false })
  },
  destroyed () {
    window.removeEventListener('keyup', this.checkEsc)
  },
  methods: {
    pigMenuToggle () {
      this.pigMenu = !this.pigMenu
    },
    closeAccountMenu () {
      if (this.accountMenu) this.accountMenu = false
    },
    closePigMenu () {
      if (this.pigMenu) this.pigMenu = false
    },
    accountMenuToggle () {
      this.accountMenu = !this.accountMenu
    },
    toggleMenu () {
      this.showMenu = !this.showMenu
    },
    checkEsc (e) {
      if (e.keyCode === 27) {
        this.showMenu = false
      }
    },
    viewPicks () {
      this.showMenu = false
      this.$router.push({ name: 'Picks' })
    }
  },
  directives: { ClickOutside },
  components: { Pig, CartIcon, CoinIcon, PersonIcon, WaveyBtn, AccountMenu, PigMenu }
}
</script>

<style lang="css" scoped>
  @import '../style/settings.css';
  .found-badge {
    position: absolute;
    left: 53px;
    top: 6px;
    border-radius: 16px;
    padding: 3px;
    padding-left: 7px;
    padding-right: 7px;
    background: var(--green);
    color: white;
    font-size: var(--small-font-size);
  }
/*  nav {
    & .router-link-active,
    & .nav__account-link--active{
      text-decoration: underline;
    }
  }*/
  #personToggle.select:after {
    top:0px;
  }
  /*#accountHeader > div:not(#accountMenu):not(#pigMenu),
  #accountHeader > a {
    height: 25px;
  }*/
  .chevron {
    width:10px;
    height:10px;
    border:1px solid currentColor;
    transform: rotate(45DEG);
    border-top-color: transparent;
    border-left-color: transparent;
    margin: 5px 10px;
    margin-top:0px;
  }
  #desktopMenu .router-link-exact-active {
    text-decoration: underline;
  }
  .throb {
    animation-name: throb;
    animation-duration: 2s;
    animation-iteration-count: infinite;
  }

  @keyframes throb {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  @media (--breakpoint-md) {
    #mobileMenu {
      display: none;
    }
  }
  @media (--breakpoint-sm-only) {
    #desktopMenu {
      display: none;
    }
  }
</style>
