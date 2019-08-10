<template lang="pug">
  button.heart-icon.inline-block.pointer(@click.prevent="$emit('click')", :class="{'heart-icon--active': active, 'heart-icon--invisible': invisible}")
    img.block(src="@/assets/icons/cart.svg", alt="Basket symbol")
</template>

<script>
export default {
  name: 'Btn--SaveClover',
  props: {
    active: { type: Boolean, default: false },
    invisible: { type: Boolean, default: true }
  }
}
</script>

<style>
.heart-icon{
  opacity:0.4;
  transition: opacity 300ms;
  &.heart-icon--invisible{
    opacity:0;
  }
  &.heart-icon--active{
    opacity:1 !important;
  }
}
@media (hover:hover) {
  .heart-icon{
    &.heart-icon--invisible{
      opacity:0;  
    }
    &:hover{
      opacity:1;
    }
  }  
}
</style>