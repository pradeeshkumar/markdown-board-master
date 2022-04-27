exports.createPages = async ({ actions ,graphql}) => {
  const { createPage } = actions
  
  // createPage({
  //   path: "/documents/practical_flutter",
  //   component:require.resolve("./src/templates/documentTemplate.js"),
  //   context:{},
  //   defer:true
  // })

  const documentTemplate = require.resolve(`./src/templates/documentTemplate.js`);

  return graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
        }
      }
    }
  `).then(result => {

    if (result.errors) {
      return Promise.reject(result.errors);
    }

    //noinspection JSUnresolvedVariable
    return result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.frontmatter.slug,
        component: documentTemplate,
        context: {
          slug: node.frontmatter.slug
        }
      })
    })

  })

}
