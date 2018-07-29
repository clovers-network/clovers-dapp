<template>
  <div id="app" class='mt3-5 pb4'>
    <app-header></app-header>
    <main>
      <router-view></router-view>
    </main>
    <instructions @seen="seenit()" v-if="attemptConnect && (notRinkeby || readOnly) && !seen"></instructions>
    <clover-list v-if="!hideMainCloverList || notRinkeby"></clover-list>
    <foot></foot>
    <messages></messages>
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader";

import Foot from "@/components/Foot";
import Instructions from "@/components/Instructions";
import CloverList from "@/components/CloverList";
import Messages from "@/components/Messages";
import { mapGetters, mapMutations, mapActions, mapState } from "vuex";

export default {
  name: "app",
  data() {
    return {
      attemptConnect: false,
      sortBy: null,
      paged: 1,
      limit: 20,
      seen: false
    };
  },
  watch: {
    notRinkeby() {
      if (this.$route.path !== "/" && this.notRinkeby) {
        this.$router.push("/");
      }
    }
  },
  computed: {
    pagedTotal() {
      return (
        Math.floor(this.allClovers.length / this.limit) +
        (this.allClovers.length % this.limit && 1)
      );
    },
    prevPossible() {
      return this.paged > 1;
    },
    nextPossible() {
      return this.paged < this.pagedTotal;
    },
    startSlice() {
      return this.limit * (this.paged - 1);
    },
    endSlice() {
      return this.limit * this.paged;
    },
    cloversSorted() {
      return this.allClovers
        .slice(0)
        .sort((a, b) => b.modified - a.modified)
        .slice(this.startSlice, this.endSlice);
    },
    hideMainCloverList() {
      return this.$route.meta.hideMainCloverList;
    },
    ...mapState(["allClovers"]),
    ...mapGetters({
      readOnly: "readOnly",
      notRinkeby: "notRinkeby",
      account: "account",
      clover: "clover"
    })
  },
  methods: {
    seenit() {
      this.seen = true;
    },
    ...mapActions(["initWeb3", "selfDestructMsg", "setUpSocket"]),
    ...mapMutations({
      registerEvent: "ADD_REGISTERED_EVENT",
      registerEvents: "ADD_REGISTERED_EVENTS",
      newUsernameEvent: "ADD_USERNAME_EVENT",
      newUsernameEvents: "ADD_USERNAME_EVENTS",
      newClovernameEvent: "ADD_CLOVERNAME_EVENT",
      newClovernameEvents: "ADD_CLOVERNAME_EVENTS"
    })
  },
  mounted() {
    console.log("mounted");
    this.setUpSocket();
    console.log("INIT-0");
    this.initWeb3()
      .then(() => {
        this.attemptConnect = true;
        console.log("INIT-3");
        // if network is not rinkeby and have not seen popup notice go to front page to show popup
        if (this.$route.path !== "/" && this.notRinkeby) {
          this.$router.push("/");
        }
      })
      .catch(error => {
        this.attemptConnect = true;
        console.error(error);
      });
  },
  destroyed() {
    this.stopWeb3Polling();
  },
  components: { AppHeader, CloverList, Messages, Instructions, Foot }
};
</script>

<style lang="css">
  @import './style/global';

  @import './style/imports';
  .intro-screen {
    .clover {
      display: inline-block;
    }
    .text-path {
      bottom: -2.6em;
      left: -2.6em;
      right: -2.6em;
      top: -2.6em;
    }
  }
  .h7{
    font-size: 0.6rem;
  }
  .h8{
    font-size: 0.5rem;
  }

  #app {
    position:relative;
    min-height:100vh;
  }
</style>
