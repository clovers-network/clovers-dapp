<template lang="pug">
  article.mx3.md-mx0.green
    featured(v-show="showFt")
    header
      page-title
        h1
          router-link(:to="{name: 'Albums'}") Albums
        p(slot="info") With <b>Albums</b>, you can group clovers together into a theme. Users can add <i>any</i> clover to <i>any</i> album but Editors can remove them. You can create new albums in your <router-link :to="{name: 'Account'}" class="underline">Dashboard</router-link>, and add to them from any clover's page.

    paged-albums
</template>

<script>
import PagedAlbums from '@/components/PagedAlbums'
import PageTitle from '@/components/PageTitle'
import Featured from '@/components/Featured'
export default {
  name: 'Albums',
  computed: {
    showFt () {
      const pg = this.$route.query.page
      return !pg || pg === 1
    }
  },
  components: { PagedAlbums, PageTitle, Featured }
}
</script>
