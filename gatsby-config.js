module.exports = {
  siteMetadata: {
    siteTitle: "force push",
    siteTitleAlt: "force push",
    siteHeadline: "Musings and how-to's",
    siteURL: "https://forcepush.tech",
    siteDescription:
      "Musings and how-to's by Johanan Idicula, a software developer",
    siteLanguage: "en",
    /* siteImage: "/banner.jpg", */
    author: "Johanan Idicula",
  },
  plugins: [
    {
      resolve: "gatsby-theme-mdx-deck",
      options: {
        // enable or disable gatsby-plugin-mdx
        mdx: false,
        // source directory
        contentPath: "content/decks",
        // base path for routes generate by this theme
        basePath: "/decks",
      },
    },
    {
      resolve: "@lekoarts/gatsby-theme-minimal-blog",
      options: {
        showLineNumbers: true,
        feed: true,
        feedTitle: "force push",
        navigation: [
          {
            title: "Hello",
            slug: "/about",
          },
          {
            title: "Contact",
            slug: "contact",
          },
        ],
        formatString: "YYYY-MM-DD",
      },
    },
    "@pauliescanlon/gatsby-mdx-embed",
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-google-analytics",
      trackingId: process.env.GOOGLE_ANALYTICS_ID,
      head: true,
      anonymize: true,
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "force push",
        short_name: "force push",
        description: "Written by Johanan Idicula, a software developer.",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#000000",
        display: "standalone",
        icon: "static/favicon.svg",
      },
    },
    "gatsby-plugin-offline",
    "gatsby-plugin-netlify",
    "gatsby-plugin-sharp",
    "gatsby-remark-images",
    "gatsby-plugin-netlify-cms",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "markdown-pages",
        path: `${__dirname}/content/posts`,
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 1200,
            },
          },
        ],
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content/pages`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content/assets`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content/posts`,
      },
    },
  ],
};
