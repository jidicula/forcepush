require(`dotenv`).config()

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE

module.exports = {
    siteMetadata: {
        // You can overwrite values here that are used for the SEO component
        // You can also add new values here to query them like usual
        // See all options: https://github.com/LekoArts/gatsby-themes/blob/main/themes/gatsby-theme-minimal-blog/gatsby-config.js
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
            resolve: `@lekoarts/gatsby-theme-minimal-blog`,
            // See the theme's README for all available options
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
        `gatsby-plugin-mdx-embed`,
        {
            resolve: `gatsby-omni-font-loader`,
            options: {
                enableListener: true,
                preconnect: [`https://fonts.gstatic.com`],
                // If you plan on changing the font you'll also need to adjust the Theme UI config to edit the CSS
                // See: https://github.com/LekoArts/gatsby-themes/tree/main/examples/minimal-blog#changing-your-fonts
                web: [
                    {
                        name: `IBM Plex Sans`,
                        file: `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap`,
                    },
                ],
            },
        },
        `gatsby-plugin-sitemap`,
        {
            resolve: `gatsby-plugin-manifest`,
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
                forceBase64Format: `png`, // valid formats: png,jpg,webp
                useMozJpeg: process.env.GATSBY_JPEG_ENCODER === `MOZJPEG`,
                stripMetadata: true,
                defaultQuality: 50,
            },
        },
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
            resolve: `gatsby-plugin-feed`,
            options: {
                query: `
          {
            site {
              siteMetadata {
                title: siteTitle
                description: siteDescription
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
                feeds: [
                    {
                        serialize: ({ query: { site, allPost } }) =>
                        allPost.nodes.map((MdxPost) => {
                            const url = site.siteMetadata.siteUrl + MdxPost.slug
                            const content = `<p>${MdxPost.excerpt}</p><div style="margin-top: 50px; font-style: italic;"><strong><a href="${url}">Keep reading</a>.</strong></div><br /> <br />`

                            return {
                                title: MdxPost.title,
                                date: MdxPost.date,
                                excerpt: MdxPost.excerpt,
                                url,
                                guid: url,
                                custom_elements: [{ "content:encoded": content }],
                            }
                        }),
                        query: `
              {
                allPost(sort: { fields: date, order: DESC }) {
                  nodes {
                    title
                    date(formatString: "MMMM D, YYYY")
                    excerpt
                    slug
                  }
                }
              }
            `,
                        output: `rss.xml`,
                        title: `force push`,
                    },
                ],
            },
        },
        shouldAnalyseBundle && {
            resolve: `gatsby-plugin-webpack-bundle-analyser-v2`,
            options: {
                analyzerMode: `static`,
                reportFilename: `_bundle.html`,
                openAnalyzer: false,
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
    ].filter(Boolean),
}
