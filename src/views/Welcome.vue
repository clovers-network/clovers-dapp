<template lang="pug">
  .div.pt4
    h1.h1.center.green.font-exp.strong Find Rare<br>Clovers
    .center.my3.relative
      .h1.flex.overflow-auto
        clv.mx2(class=" no-hover" :noClick="true" :noMoves="true" :autoPlay="false" :moveString="random()")
        clv.mx2(class=" no-hover" :noClick="true" :noMoves="true" :autoPlay="false" :moveString="random()")
        clv.mx2.bg-green(class="no-border no-hover" :noMoves="true" :autoPlay="true" :moveString="heart")
        clv.mx2(class=" no-hover" :noClick="true" :noMoves="true" :autoPlay="false" :moveString="random()")
        clv.mx2(class=" no-hover" :noClick="true" :noMoves="true" :autoPlay="false" :moveString="random()")
      button Start Now
      hr
      h2.h2.green.font-exp What is Clovers?
      .py2 Clovers is a game centered around discovering, collecting and trading mathematically generated artworks.
      button Tell Me More
      hr
      h2.h2.green.font-exp The Field
      .py2 Like looking for shapes in clouds you can browse through the Field of clovers as they're grown in real time looking for rare or interesting shapes.
</template>

<script>
import Reversi from "clovers-reversi";
export default {
  name: "Welcome",
  data() {
    return {
      heart:
        "C4E3F4C5D6F3D3C2D2E6F5E7C6B6F7B4E8F8G8G5F6B3D8G3G4H5H6H7F2E1B5D7G6A4C8D1C3E2C1B1G1G2H1G7H8C7F1H2H4B2H3A1A2B8B7A8A7A6A5A3",
      newName: null
    };
  },
  methods: {
    random() {
      const reversi = new Reversi()
      reversi.mine()
      return reversi.movesString
    }
  }
};
</script>

<style lang="stylus" >

</style>
