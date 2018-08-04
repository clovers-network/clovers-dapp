<template lang="pug">
  section.green
    header.border-bottom
      h1.h-header.px2.flex.items-center
        span.block Name
      //- change name form goes here
    section
      view-nav(:items="[{lbl: 'Picks', value: 'Account'}, {lbl: 'My Clovers', value: 'Account/Clovers'}, {lbl: '<span class=font-mono>34,484 ♣</span>', value: 'Account/Trade'}]", :initial="$route.name" @change="$router.push({name: $event})")
      router-view
</template>

<script>
import ViewNav from '@/components/ViewNav'
export default {
  name: 'Account',
  components: { ViewNav }
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
