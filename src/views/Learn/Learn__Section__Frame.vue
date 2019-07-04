<template lang="pug">
  section.learn__frame.absolute.border-green.border.rounded.green.shadow-1.overflow-hidden
    slot
</template>

<script>
export default {
  name: 'LearnSectionFrame'
}
</script>

<style>
.learn__frame{
  top:3.25vmin;
  left:3.25vmin;
  right:3.25vmin;
  bottom:3.25vmin;
  width:calc(100% - 3.25vmin * 2);
  height:calc(100% - 3.25vmin * 2);
}
</style>
