<template>
  <div>
    <div class="bg-gray white p2 md-p3" v-text='address'></div>

    <div class="p3">
      <p class="h2" v-if='mine && username'>
        <form class=' border-bottom fit' @submit.prevent="changeName()"><input class='input big fit' type="text" placeholder="Name" v-model="name"/></form>
      </p>
    </div>
    <div class="p2">
      <div v-if="myClovers" class="mt3 px2">
        <ul class="list-reset flex flex-wrap mxn2">
          <li v-for="board in myClovers" :key="board.board" class="px2 mb3">
            <clover-grid-item :board="board"></clover-grid-item>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>

  import { mapMutations, mapGetters, mapActions } from 'vuex'

  export default {

    name: 'User',

    data () {
      return {
        name: null
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
        this.name = this.username.name
      }
    },
    computed: {
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
        return this.user && this.user.clovers
        .map((c) => this.allClovers.find((ac) => ac.board === c))
      },

      ...mapGetters([
        'allUsers',
        'allClovers',
        'username',
        'account',
        'clover'
      ])
    },
    mounted () {
      this.name = this.username.name
    },
    methods: {
      changeName () {
        this.addMessage({msg: 'Updating Name', type: 'progress'}).then((msgId) => {
          this.clover.changeName(this.name).then(() => {
            this.removeMessage(msgId)
            this.selfDestructMsg({
              msg: 'Name Updated to ' + this.name,
              link: '/users/' + this.account,
              type: 'success'})
          }).catch((err) => {
            this.removeMessage(msgId)
            this.selfDestructMsg({msg: err, type: 'error'})
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
    }
  }
</script>

<style lang="css" scoped>
</style>
