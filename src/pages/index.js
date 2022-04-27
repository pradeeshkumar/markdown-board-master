import * as React from "react"
import { StaticImage ,GatsbyImage,getImage} from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { Link } from "gatsby"
import './index.css'

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { graphql } from "gatsby"
import * as StorageManager from "../StorageManager.js";


export default class IndexPage extends React.Component{

  componentDidMount(){
   
  }
  constructor(inProps){
    super(inProps);
    // Attach state, and determine if the dialog is shown based on whether we have a username in localStorage.
   
    const username = StorageManager.getName();
    console.log(`IndexPage.constructor(): username=${username}`);
    this.state = {
      dialogVisible : (username === null || username === ""),
      username : username
    };
    // Capture the data passed in.
    this.data = inProps.data;
  }

  handleDialogSave() {

    console.log("handleDialogSave()");

    // Only react to the button click if they actually entered something.
    if (this.state.username !== null && this.state.username.trim() !== "") {

      console.log(`handleDialogSave(): Saving username=${this.state.username}`);

      // First things first: close the dialog.
      this.setState({dialogVisible:false});

      // Finally, store the username.
      //localStorage.setItem("username", this.state.username);
      StorageManager.setName(this.state.username);

    }
  }

  render(){
    const image=getImage(this.data.divider);
    console.log(this.data);
    return(
<Layout>
    <Seo title="Home" />
    <div class="outerContainer">
      <Dialog open={this.state.dialogVisible} maxWidth="sm" fullWidth={true}
          disableEscapeKeyDown={true}>
          <DialogTitle>You need a username to use Markdown Board</DialogTitle>
          <DialogContent>
            <TextField label="Enter username here" fullWidth variant="outlined" required={true} defaultValue=""
              onChange={ (inEvent) => this.setState({ username: inEvent.target.value }) } />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogSave.bind(this)} color="primary" variant="outlined">Save</Button>
          </DialogActions>
        </Dialog>
        <h2>{this.data.site.siteMetadata.description}</h2>
        <h3>{this.data.site.siteMetadata.author}</h3>
    <StaticImage
      src="../images/splash.png"
      height={296}
      width={420}
      quality={95}
      formats={["auto", "webp", "avif"]}
      alt="A Gatsby astronaut"
      style={{ marginBottom: `1.45rem` }}
    />
    <br/>
    <GatsbyImage image={image} alt={this.data.site.siteMetadata.author}/>
    <br/>
    {this.data.allMarkdownRemark.edges.map((inItem, inIndex) => {
          //noinspection JSUnresolvedVariable
          return (
            <div key={inIndex} className="documentDiv">
              
                  <Link to={inItem.node.frontmatter.slug}>{inItem.node.frontmatter.title}</Link>
            </div>
          );
        })}

    </div>
    
    
  </Layout>
    );
  }
}

export const pageQuery=graphql`
query{
 divider:file(relativePath:{eq: "divider.png"}){
   childImageSharp{
     gatsbyImageData(
       layout:FIXED
       width:600
       height:25
       )
   }
 }
 site{
   siteMetadata{
     title
     description
     author
   }
 }
 allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }){
  edges{
    node{
      id
      frontmatter{
        title
        slug
      }

    }
  }
}
}
`