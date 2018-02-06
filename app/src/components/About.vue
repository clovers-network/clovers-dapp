<template>

  <div class="pb4">

    <div class="h2 max-width-4 center mx-auto">
      <div class="center underline my4 py2">The Basics of Clover</div>
      <div class="my4">Clovers employs the game of Reversi to generate a unique Visual Digital Asset consisting of the moves played to reach a final game.</div>
      <div><clv :auto-play="true" :speed="120" :no-moves="true" class=" bg-green no-hover  no-border" id="heart"  moveString="D3E3F4G5F3F2G3D2E6C4C3C2B4D6F5G2C5B5C6B3G4E7D7E8G6H3H4H5F6F7"></clv></div>
      <div class="my4 pt3">A valid Clover must possess one or more symmetries</div>
      <div class="flex justify-around h5">
        <div>
          <clv class="hover-flip-h small-clover " :speed="120" :no-moves="true" moveString="F5D6C3D3C4F4F6F3E6E7D7G6D8C5C6C7C8F7G8B6A5B5B4A4A3A6A7C2H6B3G5B7A2E8F8G4H3H5E2E3H4F1F2G3C1D2E1D1G1G2H1H2A8B2A1B1B8G7H8H7"></clv>
          <div class="mt2">Horizontal</div>
        </div>
        <div>
          <clv class="hover-flip-v small-clover " :speed="120" :no-moves="true" moveString="F5F6E6F4E3C5C4C3D3F2B4A4E2F3D2C1D1E1G5H5F1G1C2B1D6C6G4H4B3A2A3G2A1B2H1B5A5A6B6H2G3H3A7B7H6G6H7G7G8H8F8E8F7E7D8C8B8A8C7D7"></clv>
          <div class="mt2">Vertical</div>
        </div>
        <div>
          <clv class="hover-flip-diag small-clover " :speed="120" :no-moves="true"  moveString="F5F6E6F4E3C5C4D3C3F2E2D7G3D6B5F3G4E1D2C6E7E8G5G6F7H6F8D8D1C7B6G8H5H4C8B8G7A4A6B3B4A7A8H8F1H7A2C1B1C2B7A3A5B2H3H2G1H1G2"></clv>
          <div class="mt2">Diagonal</div>
        </div>
        <div>
          <clv class="hover-flip-rotate small-clover " :speed="120" :no-moves="true"  moveString="F5D6C5F4E3C4E6B6D3E2C2F2C3B3D2E1D1F7G4F3G3G6G5C1C6C7E7F8D7H6E8F6H4D8C8H3G8H5B4A5B8B5G1F1B1B2A2A3A1G7H8A6B7H7A7A8G2H2H1A4"></clv>
          <div class="mt2">Rotational</div>
        </div>
      </div>
      <div class="mt4 mb3 pt4">A Clover with more than one symmetry is more rare and valuable</div>
      <div class="flex pt2 items-center justify-center h5">
        <div class="mx4 ">300 ♧</div>
        <div class="mt2"><clv class=" small-clover " :speed="120" :no-moves="true"  moveString="F5F6E6F4E3D6C4D3C3D2E2C2F3F2D1C1B1B5E1B3A4A3A2B2C5B4A5B6A6A7B7C8B8A8C7C6A1F1G1D7E7D8F8F7E8G8G7G2G6G3"></clv><div class="mt2">Horizontal</div></div>
        <div class="mx4 ">vs</div>
        <div class="mt2"><clv class=" small-clover " :speed="120" :no-moves="true"  moveString="F5D6C3F4F6D3F3B3C6B6D7E8C4C5B5B4C7D8A5E3C8B8E7A4A6F7F2E6E2D2A3G6C2G5H5D1E1B2A1B1C1B7A8H4H3G4F8A2H6G3G2G1F1G8H8A7H1H2G7H7"></clv><div class="mt2">Horizontal + Vertical</div></div>
        <div class="mx4 ">600 ♧</div>
      </div>
      <div class="my4 pb4">When you have successfuly mined a Clover, you can claim it on the blockchain and you will be compensated Club Tokens based on its rarity.</div>
      <div class="my4">When claiming your Clover, you can also choose its starting price on the <span class="underline">Flip Market</span></div>
    </div>
    <div class="bg-dark-gray white px2 py4 zig-zag-white relative ">
      <div class="max-width-3 mx-auto flex justify-around">
        <div>
          <clv class="small-clover mt1 bg-green no-hover no-border" :speed="120" :no-moves="true"  moveString="D3E3F4G5F3F2G3D2E6C4C3C2B4D6F5G2C5B5C6B3G4E7D7E8G6H3H4H5F6F7"></clv>
        </div>
        <img class="pr2" src="/static/about-flip-right.svg" style="height: 200px;">
      </div>
    </div>
    <div class="h2 max-width-4 center mx-auto">
      <div class="my4 pt4">On the <span class="underline">Flip Market</span>, Clovers can be bought at a price that doubles with each sale.</div>
      <div class="my4 pt4 center">
        <img src="/static/flips.png">
      </div>
      <div class="my4 py4">On the <span class="underline">Flip Market</span>, the two previous buyers each receive a portion of the sale value</div>
      <div class="my4  pb4 center">
        <img src="/static/flip-diagram.svg" class="illustration">
      </div>
    </div>
    <div class="wide">
      <div class="h1 mt3 center ">
        <template v-if="!showMore">More Details?</template>
        <template v-if="showMore">Less Details!</template>
      </div>
      <div @click="showMore = !showMore" class="white absolute bg-orange pointer circle h1 toggle-history ">
        <span class="material-icons" :class="{'rotate-180': !showMore}">keyboard_arrow_down</span>
      </div>
      <div class="py1">&nbsp;</div>
      <div id='showMore' class='bg-silver expandable' :class="{'expanded-2000': showMore}">
        <div class="max-width-2 py2 mx-auto">
          <div class="h2 pt4">
            The Contract</div>
          <div class="h4 my2">
            Clovers is a Dapp that uses an <b>Ethereum Contract</b> on the <a target="_blank" href="https://www.rinkeby.io/">Rinkeby Test Network</a> located at <a href="https://rinkeby.etherscan.io/address/0xcc0604514f71b8d39e13315d59f4115702b42646" target="_blank">0xcc0604514f71b8d39e13315d59f4115702b42646</a>. The contract is an extension of <a href="https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts/token" target="_blank">OpenZeppelin's ERC20 Token Contract</a> which adheres to the global standard for Ethereum Tokens. Instead of using a traditional mining system Clovers uses the game <a  href="https://en.wikipedia.org/wiki/Reversi" target="_blank">Reversi</a> and its massive game tree as a <a href="https://en.wikipedia.org/wiki/Proof-of-work_system" target="_blank">proof of work system</a>. In order to successfully "mine" a block one must search the Reversi game tree (estimated at 10^28 possible games) for a unique endgame which displays <b>symmetry</b>. The symmetry can be on the perpendicular X or Y axis, on the diagonal X = Y or X = -Y axis, or it can be rotationally symmetrical. The miner is rewarded in <a href="https://rinkeby.etherscan.io/token/0xcc0604514f71b8d39e13315d59f4115702b42646" target="_blank">Club&nbsp;Token (♧)</a> based on how many lines of symmetry are found and how prevalent those lines of symmetry have been in the past. Afterwards the miner becomes the owner of the symmetrical game, a <b>unique visual digital asset</b> called a <b>Clover (✤)</b>, which is automatically entered into the Flip Market.</div>
          <div class="h2 mt3">
            The Flip Market</div>
          <div class="h4 my2">
            When a miner submits a new Clover they must also include a <b>starting price</b> for the Flip Market. This is the price at which the Clover becomes <b>immediately available</b> after being mined. If someone decides to purchase the Clover, it remains available to a new buyer at <b>double</b> the previous price. The profit of the sale is <b>split evenly</b> between the <b>current and previous owners</b>. This is a new and experimental model, based in part on a traditional <b>pyramid scheme</b> but <b>tweaked</b> in the hopes of creating a <b>fair</b> and lively market.</div>
          <div class="h2 mt3">
            A Note on Gas Prices</div>
          <div class="h4 my2 mb4">
            You may notice that the transaction of claiming a Clover on this contract is slow and very expensive (~5,000,000 Wei). While Reversi is a simple game to program and measures have been taken to reduce the cost, looping through 60 moves is still a costly operation on the EVM. For that reason we are using the Rinkeby Network until gas prices are lowered, Ethermint's Venus network is available, or a sufficient validation method can be enabled using an Oracle. Until then please be patient with the transaction times and stock up on free Rinkeby Ether from their faucet. For More info check out the <a href="https://github.com/okwme/clovers-dapp/" target="_blank">repo</a>.
          </div>
        </div>
      </div>
      <div class="py3 my4">&nbsp;</div>
    </div>
  </div>
</template>

<script>
  import Clv from './Clv'
  export default {

    name: 'About',

    data () {
      return {
        showMore: false
      }
    },
    components: {Clv}
  }
</script>

<style lang="scss" scoped>
.clover {
  font-size:48px;
}
#heart {
  font-size:0.6em;
}
.small-clover {
  font-size:1em;
}
#showMore {
     -moz-box-shadow:    inset 0 0 20px rgba(0, 0, 0, .2);
   -webkit-box-shadow: inset 0 0 20px rgba(0, 0, 0, .2);
   box-shadow:        inset 0px 0px 20px rgba(0, 0, 0, .2);


}

.wide {
  width:calc(100% + 60px);
  margin-left:-30px;
}

</style>
