<template lang="pug">
  article.mt2.md-mt4.mx3.md-mx0
    more-information(title="?") <b>Albums</b> are for grouping clovers together. Users can add any clover to any album but album editors can remove them. You can create albums in your <router-link :to="{name: 'Account'}" class="underline">Dashboard</router-link>, and add to them on any clover's page.
    paged-albums
</template>

<script>
import PagedAlbums from '@/components/PagedAlbums'
import MoreInformation from '@/components/MoreInformation'
export default {
  name: 'Albums',
  components: { PagedAlbums, MoreInformation }
}
</script>
