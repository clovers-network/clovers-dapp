<template>
  <div
    v-show="!success || !hide"
    class="sticky center z3">
    <div class="max-width-2 bg-purple  inline-block mx-auto p2">

      <form
        v-show="!success"
        id="mc-embedded-subscribe-form"
        action="https://billyrennekamp.us4.list-manage.com/subscribe/post?u=31bb13f30ace8a3f55fd90d3f&amp;id=aea3ef4627"
        method="post"
        name="mc-embedded-subscribe-form"
        class="validate"
        target="_blank"
        novalidate
        @submit="success = true">
        <div>Email:&nbsp;</div>
        <input
          id="mce-EMAIL"
          ref="email"
          type="email"
          value=""
          name="EMAIL"
          class="required email"
          placeholder="">
        <input
          style="display: none;"
          type="text"
          name="b_31bb13f30ace8a3f55fd90d3f_aea3ef4627"
          tabindex="-1"
          value="">
        <input
          id="mc-embedded-subscribe"
          style="display: none;"
          type="submit"
          value="Subscribe"
          name="subscribe"
          class="button">
      </form>
      <div
        v-if="success"
        class="pointer h2 thankyou"
        @click="hide = true"
        v-html="thanks"/>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
var emoji = require('node-emoji')

export default {
  name: 'Email',

  data () {
    return {
      hide: false,
      animating: false,
      error: false,
      success: false,
      loading: false,
      email: '',
      mail: emoji.get('email'),
      emojis: ['cookie', 'shamrock', 'rice_ball', 'four_leaf_clover'],
      emojiIndex: 0
    }
  },
  computed: {
    thanks () {
      return 'Thanks, talk soon ' + emoji.get(this.emojis[this.emojiIndex])
    },
    formClass () {
      return {
        animating: this.animating,
        error: this.error,
        success: this.success,
        loading: this.loading
      }
    }
  },
  watch: {
    success () {
      if (this.success) {
        window.localStorage.setItem('email_added', true)
      }
    }
  },
  mounted () {
    if (window.localStorage.getItem('email_added')) {
      this.success = true
      this.hide = true
    } else {
      // this.$refs.email.focus()
    }
  },
  methods: {
    testEmail () {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(this.email)
    },
    requestInvite () {
      if (this.loading) {
        return
      }
      if (this.testEmail(this.email)) {
        this.error = false
        axios
          .post('https://clovers.club/register', { email: this.email })
          .then(response => {
            console.log(response)
            this.success = true
            this.email = ''
          })
      } else {
        this.error = true
      }
    },
    changeEmoji () {
      this.emojiIndex += 1
      this.emojiIndex = this.emojiIndex % this.emojis.length
    }
  }
}
</script>

<style lang="css" scoped>
::-webkit-input-placeholder {
  /* Chrome/Opera/Safari */
  color: white;
  opacity: 0.5;
}
::-moz-placeholder {
  /* Firefox 19+ */
  color: white;
}
:-ms-input-placeholder {
  /* IE 10+ */
  color: white;
}
:-moz-placeholder {
  /* Firefox 18- */
  color: white;
}
.sticky {
  position: sticky;
  top: calc(100vh - 5rem);
  & > div {
    width: 100%;
  }
}
form {
  > * {
    float: left;
    font-size: 2rem;
    line-height: 2rem;
    height: 2.4rem;
    padding: 0px;
  }
}
input {
  &:focus {
    outline: none;
  }
  width: calc(100% - 100px);
  background-color: transparent;
  border: 0px;
  border-bottom: 1px solid white;
  color: white;
}
</style>
