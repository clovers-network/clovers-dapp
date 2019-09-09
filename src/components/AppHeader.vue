 <template lang="pug">
  header.no-select(:class="{'bg-white green': !showMenu, 'white': showMenu}")
    //- top bar
    .relative.z4.col-12.h-header.flex.items-center.justify-between(:class="{'fixed': showMenu}")
      //- left col
      .col-4.flex.pl2.items-center
        //- (desktop menu)
        #desktopMenu.hidden.md-flex.flex-center.ml3
          router-link.pr2(:to="{name: 'Garden'}") Garden
          router-link.pr2(:to="{name: 'Feed'}") Feed
          router-link.pr2(:to="{name: 'Users'}") Users
          router-link.pr2(:to="{name: 'Albums'}") Albums
          router-link.pr2(:to="{name: 'Activity'}")
            span Activity
            sup.h7.font-mono(v-if="showLogCount") {{ newLogs }}
        //- (menu btn - mobile)
        button#mobileMenu.md-hidden.menu-btn.pointer.relative.py2.pr2(@click='clickMenu' aria-label='Toggle Menu')
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
      h1.hidden.md-block.font-exp.col-4.py1.center.h5(v-show="!hideTitle")
        span.h3
          router-link(to="/") Clovers
          template(v-for="item in $route.meta.title")
            | &#32;<span class="font-ext">&rarr;</span>&#32;
            router-link(v-if="item[1]", :to="item[1]") {{item[0]}}
            span(v-else) {{item[0]}}
      //- right col
      #accountHeader.lg-col-4.flex.justify-end
        .relative
          //- btn-group
          .border.rounded.flex.items-center.mr2.md-mr3.overflow-hidden
            //- btn: pig
            .relative.border-right.hidden.sm-block
              button.h-nav-btn.px2.flex.items-center.pointer(@click='pigMenu = !pigMenu', aria-label="View Clover Pig")
                span.border.mr1.inline-block(style='border-radius:100%; width:13px; height:13px;')
                  span.block(:class="mining && 'bg-currentColor throb'" style='border-radius:100%; width: 13px; height: 13px; margin-top: -1px; margin-left: -1px;')
                span.h6.sm-h5.lh1.block PIG

            //- btn: picks
            router-link.h-nav-btn.px2.flex.items-center.pointer(:to="{name: 'Picks'}", :class="{'bg-green white': $route.name === 'Picks'}")
              cart-icon.mr1
              span.h6.sm-h5.lh1.block {{pickCount}}
            //- btn: tokens
            router-link.h-nav-btn.flex.px2.items-center.border-left(:to="{name: 'Trade'}", v-show="prettyUserBalance !== '-'")
              coin-icon.mr1
              span.h6.sm-h5.lh1.block {{prettyUserBalance}}
            //- bnt: account
            .relative
              button#personToggle.h-nav-btn.h6.sm-h5.pl2.pr1.flex.items-center.pointer.border-left(@click="accountMenuToggle", aria-label="View Account Menu")
                person-icon(:class="!authHeader && 'red'")
                .chevron
          //- dropdown: pig
          pig-menu.left-0(v-if="pigMenu", @closePigMenu="closePigMenu", style="transform:translateX(calc(-100% + 66px))", v-click-outside="closePigMenu")
          //- dropdown: account
          account-menu.mr2.md-mr3(v-if="accountMenu", @closeAccountMenu="closeAccountMenu", v-click-outside="closeAccountMenu")

    //- nav overlay
    nav.fixed.z3.col-12.bg-green.top-0.left-0.h-100vh(:class="showMenu ? 'visible md-invisible' : 'invisible'")
      .flex.flex-column.justify-between.center(:style="{height: winH + 'px'}")
        section.flex-auto.mx2.mt4.pt2.flex.flex-column
          header.h5.font-exp.left-align.mb1.lh3
            router-link.h1(to="/", @click.native="showMenu = false") Clovers
          nav.flex-auto.flex.flex-column
            ul.h2.list-reset.m0.flex-auto.flex.flex-column.font-ext
              router-link.flex-auto.border.rounded.mb1.flex.items-center.justify-center(:to="{ name: 'Feed' }", @click.native="showMenu = false") Feed
              router-link.flex-auto.border.rounded.mb1.flex.items-center.justify-center(:to="{ name: 'Garden' }", @click.native="showMenu = false") Garden
              router-link.flex-auto.border.rounded.mb1.flex.items-center.justify-center(:to="{name: 'Albums'}", @click.native="showMenu = false") Albums
              router-link.flex-auto.border.rounded.mb1.flex.items-center.justify-center.relative(:to="{ name: 'Activity' }", @click.native="showMenu = false")
                  span Activity <sup v-if="showLogCount">{{newLogs}}</sup>
                  //- span.circle.bg-orange.absolute(v-if="newLogs" style="width:8px;height:8px")
              //- li
                router-link.inline-block.p1(:to="{name: 'Account'}") Dashboard
        section.sm-hide.border-dashed.rounded.mt1.mx2.mb2
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
import { toDec, concatPrice } from '@/utils'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'AppHeader',
  data () {
    return {
      showMenu: false,
      pigMenu: false,
      accountMenu: false,
      showBadge: false,
      afterResize: null,
      winH: window.innerHeight,
      lastRt: {}
    }
  },
  computed: {
    mining () {
      return this.miners.length > 0
    },
    hideTitle () {
      return this.$route.meta.logo === false && this.lastRt.name
    },
    symms () {
      return this.$store.state.miningStats.symms
    },
    newLogs () {
      return concatPrice(this.$store.state.logs.length || 0)
    },
    showLogCount () {
      return this.newLogs !== '0' && this.$route.name !== 'Activity'
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
    '$route' (to, from) {
      this.showMenu = false
      this.accountMenu = false
      this.pigMenu = false
      this.lastRt = from
    },
    symms () {
      this.showBadge = true
    },
    showMenu () {
      this.winH = window.innerHeight
      this.showBadge = false
      if (this.showMenu) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = null
      }
    }
  },
  mounted () {
    window.addEventListener('keyup', this.checkEsc)
    window.addEventListener('resize', this.onResize)
  },
  destroyed () {
    window.removeEventListener('keyup', this.checkEsc)
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    clickMenu () {
      this.showMenu = !this.showMenu
    },
    closeAccountMenu () {
      console.log('close Account menu in big menu')
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
    },
    onResize () {
      clearTimeout(this.afterResize)
      this.afterResize = setTimeout(() => {
        if (window.innerWidth < 769) return // match _settings.css (md)
        this.showMenu = false
      })
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
</style>
