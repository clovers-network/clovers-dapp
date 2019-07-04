<template lang="pug">
  ul(:class="['m0 lh0', {'center': horizontal}]")
    li.symmetry-type(role='img' v-for='(sym, i) in symmetries' :key='i' :class="[sym, {'inline-block': horizontal}]")
</template>

<script>
export default {
  name: 'SymmetryIcons',
  props: {
    board: {
      type: Object,
      required: true
    },
    horizontal: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    symmetries () {
      let list = []
      let types = ['RotSym', 'Y0Sym', 'X0Sym', 'XYSym', 'XnYSym']
      for (let key in this.board) {
        if (types.includes(key) && this.board[key]) list.push(key)
      }
      return list
    }
  }
}
</script>

<style scoped>
.symmetry-type {
  border-radius: 100%;
  border: 1px solid;
  line-height: 0;
  padding: 0.8em;
  width: 1em;

  & + .symmetry-type {
    margin-left: .25em;
  }
}

.XnYSym {
  background: linear-gradient(45deg, currentColor 1.1em, transparent 0);
}

.XYSym {
  background: linear-gradient(-45deg, currentColor 1.1em, transparent 0);
}

.Y0Sym {
  background: linear-gradient(0deg, currentColor 0.8em, transparent 0);
}

.X0Sym {
  background: linear-gradient(90deg, transparent 0.8em, currentColor 0);
}

.RotSym {
  position: relative;

  &:before {
    content: '\002938';
    font-weight: bold;
    left: 0.6em;
    line-height: 0;
    position: absolute;
    top: 0.7em;
  }
}
</style>
