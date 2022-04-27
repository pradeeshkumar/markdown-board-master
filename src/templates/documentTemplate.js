import React from "react"
import { graphql } from "gatsby"
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import * as StorageManager from "../StorageManager.js";

const isBrowser=typeof window!=="undefined";
if(isBrowser){
window.showComments = function(inKey) {

    console.log("showComments()", inKey);
  
    // Store off the marker's key.
    this.currentMarkerKey = inKey;
  
    // Get the data for this marker from storage.
    const marker = StorageManager.getMarkerFromStorage(inKey);
    console.log("showComments(): markedData", marker);
  
    // Clear the comments array in state, fill it with the comments for this marker, reverse it so newest shows on top,
    // and tell React about the update.
    this.state.comments.length = 0;
    this.state.addCommentButtonDisabled = false;
    marker.comments.forEach(inValue => this.state.comments.push(inValue) );
    this.state.comments.reverse();
    console.log("showComments(): state", this.state);
    //noinspection JSUnusedLocalSymbols
    this.setState((inState, inProps) => { return this.state; });
  
  }
}
export default class Template extends React.Component {


    constructor(inProps){
        
        super(inProps);
        if(isBrowser){
        window.showComments=window.showComments.bind(this);
        }
        
        this.mr= inProps.data.markdownRemark;
        this.currentMarkerKey=null;
        this.state = { addCommentButtonDisabled : true, addCommentDialogVisible : false, newComment : "", comments : [ ] };
    }

    
    componentDidMount(){
        this.loadMarkers();
    }

    addMarker(){

        console.log("addMarker()");

  // Get the selection range, if any abort if none.
  let range = null;
  if (window.getSelection().rangeCount !== 0) {
    range = window.getSelection().getRangeAt(0);
  }
  if (!range) { return; }
  console.log("addMarker(): range", range);

  // Construct the marker object to save.
  //noinspection JSUnresolvedVariable
  const marker = {
    startOffset : range.startOffset,
    endOffset : range.endOffset,
    parentNodeData : range.startContainer.data,
    markerText : range.toString(),
    comments : [ ]
  };
  console.log("addMarker(): marker", marker);

  // Save the marker.  The key is a unique ID formed with the document's ID and a timestamp (this means there is the
  // potential for ID collisions, but the odds are pretty low... but ideally, instead of a timestamp, a GUID would
  // be produced - sounds like a "suggested exercise" to me!).
  const key = `${this.mr.frontmatter.id}-${new Date().getTime()}`;
  StorageManager.saveMarkerToStorage(key, marker);

  // Clear the range.
  document.getSelection().removeAllRanges();
  this.linkifyMarker(key);

    }

    linkifyMarker(inKey) {

        console.log("linkifyMarker()", inKey);
      
        // Load marker from persistent storage, abort if not found.
        let marker = StorageManager.getMarkerFromStorage(inKey);
        console.log("linkifyMarker(): marker", marker);
      
        // Get list of all text nodes on the page.
        const textNodes = [];
        let node = document.body.childNodes[0];
        while (node != null) {
          if (node.nodeType === 3) { textNodes.push(node); }
          if (node.hasChildNodes()) {
            node = node.firstChild;
          } else {
            while (node.nextSibling == null && node !== document.body) {
              node = node.parentNode;
            }
            node = node.nextSibling;
          }
        }
      
        // Find the parent text node of the marker based on its data content.
        let parentNode = null;
        for (let i = 0; i < textNodes.length; i++) {
          //noinspection JSUnresolvedVariable
          if (textNodes[i].data === marker.parentNodeData) {
            parentNode = textNodes[i];
            break;
          }
        }
      
        // Construct the range.
        const range = document.createRange();
        range.setStart(parentNode, marker.startOffset);
        range.setEnd(parentNode, marker.endOffset);
      
        // Linkify it.
        const link = document.createElement("a");
        link.setAttribute("href", "#");
        link.setAttribute("onClick", `window.showComments("${inKey}");`);
        range.surroundContents(link);
      
        // Clear the range.
        document.getSelection().removeAllRanges();
      
      } /* End linkifyMarker(). */
      loadMarkers(){

        console.log("loadMarkers()");
let self=this;
        const markerKeys = StorageManager.getAllMarkerKeysFromStorage(this.mr.frontmatter.id);
        console.log("loadMarkers(): markerKeys", markerKeys);
        markerKeys.forEach(function(inKey) {
          console.log(`loadMarkers(): inKey=${inKey}`);
          self.linkifyMarker(inKey);
        });

      }

    addComment(){
        console.log("addComment()");

  // Toggle the dialog's visibility flag, clear any previous newComment, and tell React about the update.
  this.state.addCommentDialogVisible = true;
  this.state.newComment = "";
  //noinspection JSUnusedLocalSymbols
  this.setState((inState, inProps) => { return this.state; });
    }
    handleDialogClose(){

        console.log("handleDialogClose()");

  // Toggle the dialog's visibility flag and tell React about the update.
  this.state.addCommentDialogVisible = false;
  //noinspection JSUnusedLocalSymbols
  this.setState((inState, inProps) => { return this.state; });
    }

    handleDialogSave(){

        console.log("handleDialogSave()");

  // First things first: close the dialog.
  this.handleDialogClose();

  // Abort if nothing was entered.
  if (this.state.newComment === null || this.state.newComment.trim() === "") { return; }

  // Now we have to add the comment to this marker, so pull it from storage, add the comment, then save it again.
  const marker = StorageManager.getMarkerFromStorage(this.currentMarkerKey);
  marker.comments.push({
    author : localStorage.getItem("username"),
    dateTime : new Date().toLocaleDateString(),
    comment : this.state.newComment
  });
  StorageManager.saveMarkerToStorage(this.currentMarkerKey, marker);

  // Finally, re-show the comments so the new one is displayed too.
  if(isBrowser){
  window.showComments(this.currentMarkerKey);
  }
    }
    
    render(){
       
        return(
            <div style={{ display : "flex", flexDirection : "column", height : "96vh" }}>
                <Dialog open={this.state.addCommentDialogVisible} onClose={this.handleDialogClose.bind(this)} maxWidth="lg" fullWidth={true}>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogContent>
            <TextField label="Enter comment here" fullWidth variant="outlined"
              onChange={(inEvent) => this.state.newComment = inEvent.target.value} />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose.bind(this)} color="secondary">Cancel</Button>
            <Button onClick={this.handleDialogSave.bind(this)} color="primary">Save</Button>
          </DialogActions>
        </Dialog>
                <Paper elevation={5} style={{ margin : "10px", padding : "4px", height : "46px" }}>
          <Grid container>
            <Grid item>
              <Button variant="contained" color="primary" style={{ marginRight : "10px" }}
                onClick={() => window.location = "/"}>
                Document List
              </Button>
              <Button variant="contained" color="secondary" style={{ marginRight : "10px" }} onClick={this.addMarker.bind(this)}>
                Add Marker
              </Button>
              <Button variant="contained" style={{ marginRight : "10px" }}
                onClick={this.addComment.bind(this)} disabled={this.state.addCommentButtonDisabled}>
                Add Comment
              </Button>
             
            </Grid>
          </Grid>
        </Paper>
        <Paper elevation={5} style={{ margin : "10px", padding : "4px", height : "70vh", overflow : "auto" }}>
          <Grid container>
            <Grid item>
              <div dangerouslySetInnerHTML={{ __html : this.mr.html }} />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={5} style={{ margin : "10px", padding : "4px", height : "30vh", overflow : "auto" }}>
          <div style={{ fontWeight : "bold", position : "sticky", top : "2px", padding : "10px",
              backgroundColor : "#eaeaea", zIndex : 99 }}>
            { this.currentMarkerKey === null ? "" : StorageManager.getMarkerFromStorage(this.currentMarkerKey).markerText}
          </div>
          <Grid container>
            <Grid item xs>
              <List>
                { this.currentMarkerKey !== null && this.state.comments.length === 0 ?
                    <ListItem key={0}><ListItemText primary="No comments for this marker" /></ListItem>
                  :
                  this.state.comments.map((inItem, inIndex) => { return (
                    <ListItem key={inIndex}>
                      <ListItemText primary={inItem.comment}
                        secondary={`${inItem.author} - ${inItem.dateTime}`} />
                    </ListItem>
                  )})
                }
              </List>
            </Grid>
          </Grid>
        </Paper>
            </div>
        );
    }

    
}

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        id
        date(formatString: "MM/DD/YYYY")
        slug
        title
      }
    }
  }
`