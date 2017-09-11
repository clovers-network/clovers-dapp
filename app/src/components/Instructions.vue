<template>
  <div class='fixed top-0 bottom-0 left-0 right-0 p3 '>
  <div class='align-middle align-center m4 p3 bg-white border-white max-width-3 mx-auto'>
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
    }
  }
</script>

<style lang="css" scoped>
a div{
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
}
</style>
