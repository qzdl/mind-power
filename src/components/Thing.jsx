import React from 'react'
import { ReactTinyLink } from 'react-tiny-link'
import Settings from './settings'

class Thing extends React.Component {
     imagep(link) {
    if (!link)
      return false
    const i = link.match(/\.(png|jpg|jpeg|gif)$/g)
    return i && i.length > 0
  }

  images(links) {
    if (this.seqnil(links))
      return links
    links.filter(l => this.imagep(l))
  }

  seqnil(seq) {
    return !seq || (seq && seq.length === 0)
  }

  links(text) {
    let li =  text.match(/(http|ftp|https|file):[/]+([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/g)
    return li ? li.map(l => {return {
      link: l,
      image: this.imagep(l),
    }}) : []
  }

  // -> data -> text
  process(text) {
    if (!text)
      return null

    let self = this;
    let props = {
      data: text,
    }

    props.links = this.links(text)

    let t = props.links.forEach(l => {
      let c =  `<a href=${l.link} target="_blank">${l.link}</a>`
      if (l.image)
        c =  `<img src=${l.link}></img>`

      props.data = props.data.replace(l.link, c)
    })
    return props;
  }

  isMoving(moving, thing) {
    return moving && thing && moving.id === thing.id
  }

  parseText(node) {
    let p = this.process(node.data)

    if (!p)
      return null

    return <div>
             <div dangerouslySetInnerHTML={{ __html: p.data }}></div>
             {p.links.map(e => {
               return <ReactTinyLink
                        cardSize="small"
                        showGraphic={true}
                        maxLine={2}
                        minLine={1}
                        url={e.link} />})}
           </div>
  }

  style(node, edge) {
    let style = edge ? {
      top: edge.y,
      left: edge.x
    } : { // then item being rendered is 'nested'
      backgroundColor: 'chucknorris'
    }

    const moving = this.props.moving
    if (this.isMoving(moving)) {
      style.top = Settings.unit(moving.y)
      style.left = Settings.unit(moving.x)
    }

    return style;
  }

  nodeInfo(node) {
    let base = <p><small>{node.content}:{node.id}</small></p>
    if (!this.props.things)
      return base


    let outrefs = this.props.things.edges[node.id]
    if (!outrefs)
      return base

    outrefs = Object.keys(outrefs)
    outrefs = outrefs && outrefs.join(' ')
    return (
      <p><small>
           {node.content}:{node.id} -> [{outrefs || ''}]
         </small></p>
    )
  }

  render() {
    const node = this.props.node
    const edge = this.props.edge
// TODO reinstate global direction of  onMouseDown={this.handleClick.bind(this)}
    return (
      <div className={"thing" + ((node.content === ' space' && node.content) || '')}
           id={node.id}
           key={node.id}
           style={this.style(node, edge)}
           onDragStart={null}>
          <h4>{node.label}</h4>
          <div className="data"></div>
          <div className="parsed">
            {this.parseText(node)}

            {this.nodeInfo(node)}
        </div>

        <div className="mount">
          <div className="dropzone" />
          {this.props.children}
        </div>
     </div>
    )
  }
}
export default Thing;
