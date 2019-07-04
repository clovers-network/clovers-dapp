<template lang="pug">
  <svg :width="width" :height="height" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:text-bottom;">
    <circle cx="7" cy="10" r="6.5" stroke="currentColor"/>
    <path d="M7.465 12.153V8.325C8.092 8.424 8.433 8.82 8.543 9.48L9.698 9.293C9.533 8.171 8.708 7.456 7.465 7.379V6.466H6.816V7.39C5.298 7.533 4.418 8.578 4.418 10.25C4.418 11.9 5.32 12.967 6.816 13.11V14.034H7.465V13.121C8.675 13.033 9.478 12.34 9.687 11.24L8.565 11.009C8.466 11.658 8.103 12.065 7.465 12.153ZM5.617 10.239C5.617 9.172 6.057 8.479 6.816 8.336V12.142C6.035 11.988 5.617 11.317 5.617 10.239Z" fill="currentColor"/>
  </svg>
</template>

<script>
export default {
  name: 'CoinIcon',
  props: {
    width: {
      type: Number,
      default: 16
    },
    height: {
      type: Number,
      default: 22
    }
  }
}
</script>
