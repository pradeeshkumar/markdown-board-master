module.exports = {
  siteMetadata: {
    title: `Markdown Document Board`,
    description: `White Board-like Application For Collaborative Markup Of Documents`,
    author: `@Venu`,
    siteUrl: `https://gatsbystarterdefaultsource.gatsbyjs.io/`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve:'gatsby-source-filesystem',
      options:{
        name:"documents",
        path:`${__dirname}/src/documents`
      }
    },
    "gatsby-transformer-remark",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "MarkdownBoard",
        short_name: "MdBoard",
        start_url: "/",
        background_color: "#6b37bf",
        theme_color: "#6b37bf",
        display: "standalone",
        icon: "src/images/icon.jpeg",
        crossOrigin: "use-credentials",
      }
    },
    {
      resolve: "gatsby-plugin-offline",
      options: {
        debug : true
      }
    }
    
  ],
}
