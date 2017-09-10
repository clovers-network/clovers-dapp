<template>
  <ul class="absolute list-reset all-symmetries">
    <li v-for="sym in symmetries" :class="sym" class="symmetry-type inline-block"></li>
  </ul>
</template>

<script>
  export default {
    name: 'symmetry',
    props: {
      board: {
        type: Object,
        required: true
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

<style>
  .all-symmetries {
    left: 50%;
    margin-top: 2em;
    transform: translateX(-50%);
  }

  .symmetry-type {
    border-radius: 100%;
    border: 1px solid;
    line-height: 0;
    margin: .4em;
    padding: .8em;
  }

  .XnYSym {
    background: linear-gradient(45deg, currentColor 1.1em, transparent 0);
  }

  .XYSym {
    background: linear-gradient(-45deg, currentColor 1.1em, transparent 0);
  }

  .Y0Sym {
    background: linear-gradient(0deg, currentColor .8em, transparent 0);
  }

  .X0Sym {
    background: linear-gradient(90deg, transparent .8em, currentColor 0);
  }

  .RotSym {
    position: relative;

    &:before {
      content: '\002938';
      font-weight: bold;
      left: .6em;
      line-height: 0;
      position: absolute;
      top: .7em;
    }
  }
</style>
