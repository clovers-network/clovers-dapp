<template lang="pug">
  article.mt2.md-mt4.mx3.md-mx0
    header
      page-title
        h1 Albums
        p(slot="info") With <b>Albums</b>, you can group clovers together into a theme. Users can add <i>any</i> clover to <i>any</i> album but Editors can remove them. You can create new albums in your <router-link :to="{name: 'Account'}" class="underline">Dashboard</router-link>, and add to them from any clover's page.
    paged-albums
</template>

<script>
import PagedAlbums from '@/components/PagedAlbums'
import PageTitle from '@/components/PageTitle'
export default {
  name: 'Albums',
  components: { PagedAlbums, PageTitle }
}
</script>
