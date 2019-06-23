<template lang="pug">
  //- basket
  .absolute.top-0.right-0.p2.flex.items-center
    slot
    .border.green.rounded.p1.flex.items-center
      cart-icon.mx1
      span.block.mx1 {{count}}
</template>

<script>
import CartIcon from '@/components/Icons/CartIcon'
export default {
  name: 'Learn__Basket',
  props: ['count'],
  components: { CartIcon }
}
</script>

<style>
</style>
