<template>
  <div @click.self="seen()" class='pointer z4 bg-darken-4 fixed top-0 bottom-0 left-0 right-0 p3 '>
  <div class='no-pointer relative align-middle border border-silver align-center m4 p3 bg-white border-white max-width-3 mx-auto'>
      <div class="absolute top-0 right-0 mt1 mr1 pointer bold h2 rotate" @click="seen()">➕</div>
      <div class='h1 mb2'>Not Connected to Clovers Network</div>
      <div class='h3 mb2'>To use the Clovers Dapp please connect to the <a href="https://www.rinkeby.io/" target="_blank">Rinkeby</a> test Network using the browser plugin <a target="_blank" href="https://metamask.io/">MetaMask</a> or the <a href="https://github.com/ethereum/mist/releases" target="_blank">Mist Browser</a>.</div>
      <div >
        <a class='p2 inline-block' style="width:50%;" target="_blank" href="https://metamask.io/">
          <div class=" fit"  style="min-height: 300px; background-image: url('https://www.dropbox.com/s/2trsocartw6go3n/Screenshot%202017-09-11%2020.12.51.png?dl=1')"></div>
        </a><a class='p2 inline-block' style="width:50%;" href="https://github.com/ethereum/mist/releases" target="_blank">
          <div class=" fit" style="min-height: 300px; background-image: url('https://www.dropbox.com/s/v6u6m6ts71yfapx/Screenshot%202017-09-11%2020.37.39.png?dl=1')"></div>
        </a>
      </div>
  </div>
  </div>
</template>

<script>
  export default {

    name: 'Instructions',

    data () {
      return {

      }
    },
    methods: {
      seen () {
        this.$emit('seen')
      }
    }
  }
</script>

<style lang="css" scoped>
.rotate {
  transform: rotate(45deg) translate3d( 0, 0, 0);
}
a div{
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
}
</style>
