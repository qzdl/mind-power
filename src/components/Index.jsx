import React, { Component } from "react";
import elasticlunr from "elasticlunr";

let data =  [
      {
        id: "node1",
        label: "Circle1\ndirkle",
        original: "yep well that's something statey mc stateface and chopi is my baby",
        meta: "updated 3 minutes ago"
      },
      {
        id: "node2",
        label: "Circle2",
        original: "some description text of the card circle 2 from data bindings how nice and cool",
        meta: ""
      }
    ]

// TODO fuzzy search
let  ftindex =  elasticlunr(function() {
  this.addField('label');
  this.addField('original');
  this.setRef('id');
  this.saveDocuments = true
})



class Index extends Component {
  state = {
    query: '',
    data: data,
    results: data,
    ftindex: ftindex
  }

  getInfo = () => {
    let res = this.state.ftindex.search(this.state.query)
    console.log(res)
    
    this.setState({
      results: this.state.ftindex.search(this.state.query).map(({ ref, score }) => {
        // Get doc by ref
        const doc = this.state.ftindex.documentStore.getDoc(ref);
        return {
          ref,
          score,
          doc
        };
      })
    })
  }
  
  handleInputChange = () => {
    this.setState({
      query: this.search.value
    }, () => {
      if (this.state.query && this.state.query.length > 1) {
        
          this.getInfo()
        
      } 
    
    })}


  results = () => {
    let binder = d => d.map(item => {
      item = item.doc || item
      return (
        
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{item.label}</h5>
              <p className="card-text">{item.original}</p>
              <p className="card-text"><small className="text-muted">{item.meta}</small></p>
            </div>
          </div>
        )})

    if (this.state.results && this.state.results.length > 0)
      return <div className="card-group">{binder(this.state.results)}</div>
    else return <div className="card-group"><h4>NO RESULTS</h4> {binder(this.state.data)}</div>
  }
  
  render() {
    return (
      <div className="index">
        <div className="container">
        
            <div className="col-lg-12">
              <input
                placeholder="[search here...]"
                ref={input => this.search = input}
                onChange={this.handleInputChange} />
              
        
                {this.results()}
           
           
          </div>
        </div>
      </div>
    );
  }
}
export default Index;
