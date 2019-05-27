<template lang="pug">
  section.learn__frame.absolute.border-green.border.rounded.green.shadow-1
    slot
</template>

<script>
export default {
  name: 'Learn__Section__Frame'
}
</script>

<style>
.learn__frame{
  top:3rem;
  left:3rem;
  right:3rem;
  bottom:3rem;
  width:calc(100% - 3rem * 2);
  height:calc(100% - 3rem * 2);
}
</style>
