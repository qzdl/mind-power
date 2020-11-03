import React from 'react;

const blocklist = (props) => {
  <div class="card-group">
    {this.state.results.map(props => {             
      return <div class="card">
        <div class="card-body">
          <h5 class="card-title">{item.label}</h5>
          <p class="card-text">{item.original}</p>
          <p class="card-text"><small class="text-muted">{item.meta}</small></p>
       </div>
     </div>
     })}
  </div>
}

export default blocklist;
