<template lang="pug">
  section.green
    .h-header
    header.border-bottom
      h1.h-header.px2.flex.items-center
        span.block Name
      //- change name form goes here
    section
      nav.sticky.top-0.left-0.flex.relative.h-header.border-bottom
        //- TODO: proper font-size (smaller)
        router-link(:to="{name: 'Account'}").col-4.flex.pointer.opacity-50
          span.block.m-auto Picks
        router-link(:to="{name: 'Account/Clovers'}").col-4.flex.pointer.opacity-50
          span.block.m-auto My Clovers
        router-link(:to="{name: 'Account/Trade'}").col-4.flex.pointer.opacity-50
          span.block.m-auto.font-mono 34,484 ♣
        //- highlight bar
        .absolute.col-4.bg-green.left-0.trans-transform.pointer-events-none(style="bottom:-2px;height:3px", :data-view="$route.name")
      router-view
</template>

<script>
export default {
  name: 'Account'
}
</script>

<style scoped>
.router-link-active{
  opacity:1;
}
/* highlight bar */
[data-view="Account/Clovers"]{transform:translateX(100%);}
[data-view="Account/Trade"]{transform:translateX(200%);}
</style>
