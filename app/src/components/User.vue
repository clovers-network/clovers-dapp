<template>
  <div>
    <div class=" h2 bg-gray white p2 md-p3 pre mono" >
      <a class="white underline" target="_blank" :href="'https://rinkeby.etherscan.io/token/0xcc0604514f71b8d39e13315d59f4115702b42646?a=' + address">{{address}}</a>
          <div class='h1 right'>{{balanceFormatted}} ♧</div>

    </div>
    <activity :address="address"></activity>
    <div class="p3">
      <template v-if="mine">
        <form class='border-bottom fit' @submit.prevent="changeName()">
          <input class='input big fit' type="text" placeholder="Name" v-model="name"></input>
        </form>
      </template>
      <template v-else>
        <p class='h1' v-html="name"></p>
      </template>
    </div>
    <div class="p2">
      <div v-if="myClovers" class="mt3 px2">
        <clover-list :filter="address"></clover-list>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapGetters, mapActions } from 'vuex'
  import CloverList from '@/components/CloverList'
  import Activity from '@/components/Activity'

  export default {
    name: 'User',
    data () {
      return {
        name: null,
        balance: null
      }
    },
    watch: {
      allUsers () {
        console.log('all Users changed')
      },
      user () {
        console.log('user changed')
      },
      'user.clovers': function () {
        console.log('users.clovers changed')
      },
      username () {
        this.name = this.username
      }
    },
    computed: {
      balanceFormatted () {
        return this.balance && this.balance.toString().split('"').join('').toLocaleString()
      },
      username () {
        return this.user && this.user.name
      },
      mine () {
        return this.address === this.account
      },
      address () {
        return this.$route.params.address
      },
      user () {
        return this.allUsers.find((u) => u.address === this.address)
      },
      myClovers () {
        return this.user && this.user.clovers.map((c) => this.allClovers.find((ac) => ac.board === c))
      },

      ...mapGetters([
        'readOnly',
        'allUsers',
        'allClovers',
        'account',
        'clover'
      ])
    },
    mounted () {
      this.name = this.username
      this.clover.balanceOf(this.address).then((amount) => {
        this.balance = amount
      })
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
