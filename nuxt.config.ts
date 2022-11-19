import { defineNuxtConfig } from "nuxt3";

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    baseSiteURL: process.env.NUXT_SITE_BASE,
    public: {
      apiBase: process.env.NUXT_APPWRITE_URL + process.env.NUXT_APPWRITE_API_V,
      siteBase: process.env.NUXT_SITE_BASE,
      database: process.env.NUXT_APPWRITE_DATABASE_ID,
      project: process.env.NUXT_APPWRITE_PROJECT_ID,
      profileCollection: process.env.NUXT_APPWRITE_PROFILE_COLLECTION_ID,
      userDataCollection: process.env.NUXT_APPWRITE_USER_DATA_COLLECTION_ID,
      publicationCollection: process.env.NUXT_APPWRITE_PUBLICATION_COLLECTION_ID,
      postsCollection: process.env.NUXT_APPWRITE_POSTS_COLLECTION_ID,
      userStorageBucket: process.env.NUXT_APPWRITE_USER_STORAGE_BUCKET,
      pubStorageBucket: process.env.NUXT_APPWRITE_PUB_STORAGE_BUCKET
    },
  },
  css: ["~/assets/css/tail.css"],
   meta: [
    { name: 'description', content: 'Breezy Book' }
  ],
  build: {
    postcss: {
      postcssOptions: require("./postcss.config.js"),
    },
  },
});
