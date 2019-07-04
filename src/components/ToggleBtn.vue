<template>
  <v-touch tag="button" class="outer block border col-12 pointer" :class="outerClass" @click.native="$emit('click')" @swipeleft="$emit('swipeleft')" @swiperight="$emit('swiperight')" :swipe-options="{threshold: 150}">
    <div class="middle col-6 bg-current-color trans-transform flex" :class="[middleClass, {'transl-x-100': active}]">
      <div class="inner block font-ext h2 m-auto line-height-1" :class="innerClass">{{!active ? labels[1] : labels[0]}}</div>
    </div>
  </v-touch>
</template>

<script>
export default {
  name: 'ToggleBtn',
  props: {
    small: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    labels: { type: Array, default: () => ['On', 'Off'] },
    theme: { type: String, default: 'white' }
  },
  data () {
    return {
      smallOuter: ['sm-height'],
      normalOuter: [],
      smallMiddle: ['sm-height', 'mtn1'],
      normalMiddle: [],
      smallInner: ['h4', 'sm-height'],
      normalInner: []
    }
  },
  computed: {
    outerClass () {
      return [this.theme === 'white' ? 'bg-dots-white' : 'bg-dots-green', ...(this.small ? this.smallOuter : this.normalOuter)]
    },
    middleClass () {
      return [this.theme === 'white' ? 'bg-dots-white' : 'bg-dots-green', ...(this.small ? this.smallMiddle : this.normalMiddle)]
    },
    innerClass () {
      return [(this.theme === 'white' ? 'green' : 'white'), ...(this.small ? this.smallInner : this.normalInner)]
    }
  }
}
</script>

<style scoped>
.outer {
  border-radius: 5px;
}
.middle {
  border-radius: 5px;
}
.inner {
  border-radius: 5px;
}
.sm-height {
  line-height: 2.6rem;
  height: 2.6rem;
  max-width: 8rem;
}
.mtn1 {
  margin-top:-1px;
}
button {
  max-width: 36rem;
  & > div {
    height: 5rem;
    & > div {
      padding-bottom: 0.1em;
    }
  }
}
</style>
