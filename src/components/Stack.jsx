import React from "react";

class Stack extends React.Component {
    shimstack() {
      let t = [this.props.last, this.props.current]
      return t.map(e => this.tab(e))
    }
    
    tab(t) {
        if (t)
            return <div className="tab" key={t.id}>{t.label}</div>
    }
    
    render() {
        return <div id="stack">
                   {this.shimstack()}
               </div>
    }
    
}


export default Stack
