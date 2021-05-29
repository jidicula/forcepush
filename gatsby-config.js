module.exports = {
  siteMetadata: {
    siteTitle: "force push",
    siteTitleAlt: "force push",
    siteHeadline: "Musings and how-to's",
    siteUrl: "https://forcepush.tech",
    siteDescription:
      "Musings and how-to's by Johanan Idicula, a software developer",
    siteLanguage: "en",
    siteImage: "/forcepush-banner.png",
    author: "Johanan Idicula",
  },
  plugins: [
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-57608712-2",
        head: true,
        anonymize: true,
      },
    },
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
            slug: "/contact",
          },
        ],
        formatString: "YYYY-MM-DD",
      },
    },
    "@pauliescanlon/gatsby-mdx-embed",
    "gatsby-plugin-sitemap",

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
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        // Defaults used for gatsbyImageData and StaticImage
        defaults: {},
        // Set to false to allow builds to continue on image errors
        failOnError: true,
        // deprecated options and their defaults:
        base64Width: 20,
        forceBase64Format: ``, // valid formats: png,jpg,webp
        useMozJpeg: process.env.GATSBY_JPEG_ENCODER === `MOZJPEG`,
        stripMetadata: true,
        defaultQuality: 50,
      },
    },
    "gatsby-remark-images",
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
    {
      resolve: `gatsby-source-git`,
      options: {
        name: `jidicula-resume`,
        remote: `https://github.com/jidicula/jidicula-resume.git`,
        branch: `master`,
        local: "./public/jidicula-resume",
        // Only import the compiled PDF.
        patterns: `**.pdf`,
      },
    },
  ],
}
