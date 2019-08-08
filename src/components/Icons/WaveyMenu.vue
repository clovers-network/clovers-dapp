<template lang="pug">
  div(:class="{'wave-btn--white': isWhite}")
</template>

<script>
export default {
  name: 'WaveyMenu',
  props: {
    isWhite: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
div{
  width:48px;
  position:relative;
  height: 14px;
  background: url('../../assets/icons/wave.svg') repeat-x 0%;
  background-size: contain;
  animation: 3s wave linear infinite;
  box-shadow:inner 0 0 1rem rgba(red,1);

  &.wave-btn--white {
    background: url('../../assets/icons/wave-white.svg') repeat-x 0%;
  }

  &::before{
    content:"";
    background:linear-gradient(90deg, rgba(white,0) 25%, rgba(white,1) 75%);
    height:100%;
    width:100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}

@keyframes wave {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 48px 0;
  }
}
</style>
