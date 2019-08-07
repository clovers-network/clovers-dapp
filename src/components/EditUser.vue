<template lang="pug">
  .green.fixed.z3.flex.modal(@click.self="cancel")
    .m-auto.bg-white.flex.flex-column.justify-between.border.border-dashed.rounded
      header
        .h-header.flex.justify-between.items-center
          .col-4.pl3.pt1
            button.pointer.h5(@click="cancel") Close

      .px3.pb3
        .mb3.center
          .inline-block.circle
            img(:src="displayImage" width="196" height="196")

        form.m0(@submit.prevent="updateName")
          label.block.mb2.h5.center Change user name
          input.border.p2.rounded.col-12.input(v-model="form.name" autocomplete="off" placeholder="Edit username" v-autofocus="true")
          input.mt2.border.p2.rounded.col-12.input(v-model="form.image" autocomplete="off" placeholder="Type to edit image")

          .pt3.center
            input.pointer.py2.px3.rounded.bg-green.white(type="submit" value="Save" :disabled="!changed")

</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'EditUser',
  data () {
    return {
      saving: false,
      form: {
        address: null,
        name: null,
        image: null
      }
    }
  },
  computed: {
    account () {
      return this.$store.state.account
    },
    signedIn () {
      return !!this.$store.getters.authHeader
    },
    displayImage () {
      return this.userImage(this.form, 196)
    },
    changed () {
      return this.form.name !== this.userName(this.user) ||
        this.form.image !== this.user.image
    },

    ...mapGetters(['user', 'userName', 'userImage'])
  },
  methods: {
    checkEsc (e) {
      if (e.keyCode === 27) {
        this.cancel()
      }
    },

    updateName () {
      if (!this.changed) return
      this.changeUsername({
        address: this.user.address,
        name: this.form.name,
        image: this.form.image
      }).then(() => {
        this.cancel()
      })
    },
    cancel () {
      this.$emit('cancel')
    },

    ...mapActions(['changeUsername'])
  },
  beforeMount () {
    this.form.address = this.user.address
    this.form.name = this.userName(this.user)
    this.form.image = this.user.image || null
  },
  mounted () {
    window.addEventListener('keyup', this.checkEsc)
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.checkEsc)
  }
}
</script>
