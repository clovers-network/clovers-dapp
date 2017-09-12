<template>
  <div class="max-width-2 mx-auto p1">
    <div class="h1 my3">
      About Clovers</div>
    <div class="h2 mt3">
      The Contract</div>
    <div class="h4 my2">
      Clovers is an <b>Ethereum Contract</b> on the <a target="_blank" href="https://www.rinkeby.io/">Rinkeby Test Network</a> located at <a href="https://rinkeby.etherscan.io/address/0xcc0604514f71b8d39e13315d59f4115702b42646" target="_blank">0xcc0604514f71b8d39e13315d59f4115702b42646</a>. It is an extension of <a href="https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts/token" target="_blank">OpenZeppelin's ERC20 Token Contract</a> which adheres to the global standard for Ethereum Tokens. Instead of using a traditional mining system Clovers uses the game <a  href="https://en.wikipedia.org/wiki/Reversi" target="_blank">Reversi</a> and its massive game tree as a <a href="https://en.wikipedia.org/wiki/Proof-of-work_system" target="_blank">proof of work system</a>. In order to successfully "mine" a block you have to search the Reversi game tree (estimated at 10^28 possible games) for a unique endgame which displays <b>symmetry</b>. The symmetry can be on the perpindicular X or Y axis, on the diagonal X = Y or X = -Y axis, or it can be rotationally symmetrical. The miner is rewarded in <a href="https://rinkeby.etherscan.io/token/0xcc0604514f71b8d39e13315d59f4115702b42646" target="_blank">Club&nbsp;Token (♧)</a> based on how many lines of symmetry are found and how prevalent those lines of symmetry have been in the past. Afterwards the miner becomes the owner of the symmetrical game, a <b>unique visual digital asset</b> called a <b>Clover (✤)</b>, which is automatically entered into the Flip Market.</div>
    <div class="h2 mt3">
      The Flip Market</div>
    <div class="h4 my2">
      When a miner submits a new Clover they must also include a <b>starting price</b> for the Flip Market. This is the price at which the Clover becomes <b>immediately available</b> after being mined. If someone decides to purchase the Clover, it remains available to a new buyer but at <b>double</b> the previous price. The distribution of the sale are <b>split evenly</b> between the <b>current and previous owners</b>. This is a new and experimental model, based in part on a traditional <b>pyramid scheme</b> but <b>tweaked</b> in the hopes of creating a <b>fair</b> and lively market.</div>
    <div class="h2 mt3">
      A Note on Gas Prices</div>
    <div class="h4 my2 mb4">
      You may notice that the transaction of claiming a Clover on this contract is slow and very expensive (~4,000,000 Wei). While Reversi is a simple game to program and measures have been taken to reduce the cost, looping through 60 moves is still a costly operation on the EVM. For that reason we are using the Rinkeby Network until gas prices are lowered, Ethermint's Venus network is available, or a sufficient validation method can be enabled using an Oracle. Until then please be patient with the transaction times and stock up on free Rinkeby Ether from their faucet. For More info check out the <a href="https://github.com/okwme/clovers/" target="_blank">repo</a>.
    </div>
  </div>
</template>

<script>
  export default {

    name: 'About',

    data () {
      return {

      }
    }
  }
</script>

<style lang="css" scoped>
</style>
