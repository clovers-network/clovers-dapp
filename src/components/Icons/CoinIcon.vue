<template>
  <!-- use .flex.items-center in parent - inline-block/vertical-align doesnt work consistently -->
  <svg class="block" :width="width" :height="width" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="29.5" cy="29.5" r="29.5" fill="currentColor" fill-opacity=".16"/>
    <path d="M31.4519 36.9945V21.3194C33.9996 21.7248 35.3852 23.3463 35.8322 26.0489L40.5253 25.2832C39.8549 20.6888 36.5026 17.7609 31.4519 17.4456V13.707H28.8147V17.4907C22.6466 18.0762 19.0708 22.3554 19.0708 29.202C19.0708 35.9585 22.736 40.3277 28.8147 40.9133V44.6969H31.4519V40.9583C36.3685 40.598 39.6314 37.7602 40.4807 33.2559L35.9216 32.31C35.5193 34.9675 34.0443 36.6341 31.4519 36.9945ZM23.9428 29.1569C23.9428 24.7877 25.7307 21.95 28.8147 21.3644V36.9495C25.6413 36.3188 23.9428 33.5712 23.9428 29.1569Z" fill="currentColor"/>
  </svg>
</template>

<script>
export default {
  name: 'CoinIcon',
  props: {
    width: {
      type: Number,
      default: 14
    }
  }
}
</script>
