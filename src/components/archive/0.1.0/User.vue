<template>
  <div class="">
    <div class=" h2 bg-gray white p2 md-p3 pre mono" >
      <div class="max-width-3 mx-auto">
        <a
          :class="{small: address.length > 35}"
          class="  white underline"
          target="_blank"
          :href="'https://rinkeby.etherscan.io/token/0xcc0604514f71b8d39e13315d59f4115702b42646?a=' + address">{{ address }}</a>
        <div class='h1 right'>{{ balanceFormatted }} ♧</div>
      </div>
    </div>
    <div class="p3 max-width-3 mx-auto">
      <template v-if="mine">
        <form
          class='border-bottom fit'
          @submit.prevent="changeName()">
          <input
            class='input big fit'
            type="text"
            placeholder="Name"
            v-model="name">
        </form>
      </template>
      <template v-else>
        <p
          class='h1'
          v-html="name"/>
      </template>
    </div>

    <activity :address="address"/>
    <clover-list :filter="address"/>

  </div>
</template>

<script>
import { mapMutations, mapActions, mapState } from 'vuex'
import CloverList from '@/components/CloverList'
import Activity from '@/components/Activity'

export default {
  name: 'User',
  data () {
    return {
      name: null
    }
  },
  watch: {
    user () {
      console.log('user changed')
    },
    'user.clovers': function () {
      console.log('users.clovers changed')
    },
    account () {
      console.log('account changed')
    },
    username () {
      this.name = this.username
    }
  },
  computed: {
    balanceFormatted () {
      return this.balance && this.balance.toString(10).split('"').join('').toLocaleString()
    },
    username () {
      return this.user && this.user.name
    },
    mine () {
      console.log(this.address, this.account)
      return this.address && this.account && (this.address.toUpperCase() === this.account.toUpperCase())
    },
    address () {
      return this.$route.params.address
    },
    user () {
      return this.users.find((u) => u.address.toLowerCase() === this.address.toLowerCase())
    },
    myClovers () {
      return this.user && this.user.clovers.map((c) => this.allClovers.find((ac) => ac.board === c))
    },

    ...mapState([
      'allClovers',
      'balance',
      'users',
      'readOnly',
      'account',
      'clover'
    ])
  },
  mounted () {
    this.name = this.username
  },
  methods: {
    changeName () {
      if (this.readOnly) {
        this.selfDestructMsg({
          msg: 'Please connect to the Rinkeby Network using MetaMask or Mist Browser',
          link: 'https://metamask.io/',
          type: 'error'
        })
        return
      }
      this.addMessage({msg: 'Updating Name', type: 'progress'}).then((msgId) => {
        this.clover.changeName(this.name).then(() => {
          this.removeMessage(msgId)
          this.selfDestructMsg({
            msg: 'Name Updated to ' + this.name,
            link: '/users/' + this.account,
            type: 'success'})
        }).catch((err) => {
          console.error(err)
          this.removeMessage(msgId)
          this.selfDestructMsg({msg: 'Error check logs', type: 'error'})
          console.log(err)
        })
      })
    },

    ...mapActions([
      'selfDestructMsg',
      'addMessage'
    ]),

    ...mapMutations({
      removeMessage: 'REMOVE_MSG'
    })
  },
  components: {CloverList, Activity}
}
</script>
<style  lang="scss" scoped>
  .small{
    font-size: 0.8em;
  }
</style>
