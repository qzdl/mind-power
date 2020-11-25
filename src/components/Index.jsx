import React, { Component } from "react";
import Thing from './Thing'

class Index extends Component {
  state = {
    query: '',
    results: [],
    placeholders: [
      "search here...",
      "ho hum diddly dum...",
      "LOOK AT ME SEARCH SOMETHING..."
    ],
    ftindex: this.props.ftindex
  }

  getInfo = () => {
    let res = this.state.ftindex.search(this.state.query)
    console.log('search', this.state.query, res, this.state.ftindex)
    
    this.setState({
      results: res.map(({ ref, score }) => {
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
    })
  }

  results = () => {
    let binder = (d) => d.map(item => {
      item = item.doc || item
      return (
        <div className="result" key={item.id}>
          <Thing node={item} things={this.props.things}/>
        </div>
      )
    })

    if (this.state.results && this.state.results.length > 0)
      return <div className="results">
               {binder(this.state.results)}
             </div>
    else
      return <div className="results"></div>
  }

  placeholder() {
    return `[ ${this.state.placeholders[Math.floor(Math.random() * this.state.placeholders.length)]} ]`
  }
  render() {
    return (
      <div className="index">
        <div className="search">
          <i className="fa fa-search"></i>
          <input
            placeholder={this.placeholder()}
            ref={input => this.search = input}
            onChange={this.handleInputChange} />
        </div>

          {this.results()}

      </div>
    );
  }
}
export default Index;
