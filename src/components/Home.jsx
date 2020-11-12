/*
 context includes where you've been


  a space; an explicit organisation of things, with a name

   has some data
     shape:  dimensions of the space
     view:   the part of the space being seen (x y)
     things: a list of things with positional information
     stack:  a stack/tree of breadcrumbs of places past

   has some gestures
     create:   add a new /thing/
     conjoin:  add /things/ from the /index/
     reflect:  view /interesting/ things about your /context/
     navigate: move around the /space/
     place:    move things around the /space/
     exit:     get out of the given /thing/
     enter:    go into a given /thing/
     inspect:  get information from a /thing/
     focus:    select /things/

 a thing; a visual & behavioural unit as an abstraction on levels of information

   space: see space; "an explicit organisation of things, with a name"
   block: some demarcation of drawing or text
   quote: some part of a block

   behaviour can be dispatched according to these types
     exit(last)
     exit->space
     exit->block
     exit->quote
       go up the /stack/
       view the /stack/
     enter(last, target)
     enter->space
     enter->block
     enter->quote
       go to the /space/ containing the original definition, and /focus/



 inspiration:
   mercuryos:    https://mercuryos.com/
   semilattice:  https://semilattice.xyz/
   muse:         https://museapp.com/
   roamresearch: https://roamresearch.com/
   org-roam:     https://orgroam.com/
   emacs-freex:  https://github.com/gdetre/emacs-freex/
   graphbrain:   https://github.com/graphbrain/graphbrain/
   memex:        https://github.com/steve-1820/memex

 research:
   Augmenting Human Intellect: A Conceptual Framework
     https://www.dougengelbart.org/content/view/138
   Semantic Hypergraphs
     TODO
*/

import React from "react";
import Data from "./data";
let objthings = Data.datamodel;

// let objthings = {
//   'nodes': [
//     {
//       id: 1,
//       content: 'space',
//       label: 'nested rendering example'
//     },
//     {
//       id: 2,
//       content: 'block',
//       label: 'outermost'
//     },
//     {
//       id: 3,
//       content: 'block',
//       label: 'middle (mostly haha)'
//     },
//     {
//       id: 4,
//       content: 'block',
//       label: 'innermost'
//     },
//     {
//       id: 5,
//       label: 'hi chopi'
//     }
//   ],
//   edges: {
//     1: {2: {}, 3: {}, 4:{}, 5: {}},
//     2: {3: {}, 5: {}},
//     3: {4: {}},
//     4: {5: {}}
//   }
// }

let initthings = {
  nodes: new Map(),
  edges: []
}

objthings.nodes.forEach(e => {
   initthings.nodes.set(e.id, e)
})

initthings.edges = objthings.edges

class Home extends React.Component {

  state = {
    stack: {},
    shape: {},
    view:  {},
    things: initthings,
    currentSpace: initthings.nodes.get(1),
    spaceThings: this.spaceGraph(initthings, initthings.nodes.get(1))
  }

  handleSpaceChange(space) {
    this.getInfo()

  }

  getInfo() {
    const s = this.spaceGraph(this.state.things, this.state.currentSpace)
    console.log('getInfo: ', s)
    this.setState({
      spaceThings: this.spaceGraph(this.state.things, this.state.currentSpace)
    })
    return s;
  }

  componentDidMount() {
    if (!this.state.things || Object.keys(this.state.things).length === 0) {
      console.log('mount: things is empty');
      //return 0;
    }
    console.log('mount: ', this.state.things)

    this.mountSpace()
  }

  spaceGraph(graph, space) {
    // all nodes E connected to SPACE
    // all nodes A connected to node e from E,
    //   where a from A is connected to SPACE (in E) | as B

    let se = graph.edges[space.id] // {}
    let E = Object.keys(se)        // [""]

    // for each node (E.target), collect (A: edges & nodes) of
    // first degree to E where exists an edge A to space
    let degreeSpace = {}
    let nodeSpace = new Map()
    E.forEach(e => {
      // get edges for e | as {A}
      const A = graph.edges[e]
      // nodes for A
      nodeSpace.set(parseInt(e, 10), graph.nodes.get(parseInt(e, 10)))

      if (A && Object.keys(A).length > 0) {
        // filter A:a where a is one of seA | as {B}
        let B = {}
        for (const a in A) {
          // (predicate) where a is one of E
          if (E.includes(a)) { // TODO explore predicates (on edge / generic)
            B[a] = A[a]
            // nodes for Bn
            nodeSpace.set(parseInt(a, 10), graph.nodes.get(parseInt(a, 10)))
          }
        }
        degreeSpace[e] = B;
      }
    })

    // combine space edges & degree edges | as {space subgraph edges}
    degreeSpace[space.id] = se

    return  {
      nodes: nodeSpace,
      edges: degreeSpace
    }
  }

  mountSpace() {
    // (evt) resize to window
    window.addEventListener('resize', () => {
      let c = document.getElementById('container')
      c.style.height =  (window.innerHeight * .8)+ "px";
      console.log('resize: ', c.style.height)
      this.setState({view: {}})
    })

    let space = document.getElementById('container')
    let things = document.getElementsByClassName('thing')
    let btn = document.getElementById('print')

    // persist
    btn.onclick = () => {
      let fucking_javascript = []
      for (const e of this.state.things.nodes.values()) {
        fucking_javascript.push(e)
      }
      console.log(JSON.stringify({
        nodes: fucking_javascript,
        edges: this.state.things.edges}, null ,2))
    }

    // mapping view to position in space (TODO scrollable bg)
    // better to use bounding box function for [computed]
    // const [w,h] = [space.style.width, space.style.height]

    // (evt) create
    space.onclick = this.create.bind(this)


    // (evt) navigate
    space.ondrag = this.navigate

    // (evt) move
    // fucking js collections; why isn't a map a sequence
    for (var i=0;i<things.length;i++) {
      let e = things[i]
      this.bindEvents(e)
    }
  }

  bindEvents(e) {

  }

  create(point) {
    //console.log('create: ', point, point.target.id)

    if (point.target.id === 'container') {
      let e = document.createElement('div');
      e.className += ' thing'

      this.bindEvents(e)
      point.target.appendChild(e)

      e.style.position = 'absolute'
      let r = e.getBoundingClientRect()
      e.style.top = point.layerY - r.height/2 + "px";
      e.style.left = point.layerX - r.width/2 +  "px";


    }
  }

  updatePosition(elem) {
    // things are positioned with respect to a space by their edge
    console.log('updatePosition: ', elem)

    let t = this.state.things
    let edge = t.edges[this.state.currentSpace.id][elem.id];
    [edge.x, edge.y] = [elem.style.left, elem.style.top]
    t.edges[this.state.currentSpace.id][elem.id] = edge;

    console.log('updated ', elem.id, ' as', edge)
    this.setState({ things: t })
  }

  navigate(point) {
    console.log('navigate: ', point)
    // TODO disambiguate click & drag movements against container
    // TODO map xy mouse movements to LR/UD scrolling
  }

  parentMatch(elem, depth) {
    //console.log('parentMatch: ', depth, elem)
    if (0 >= depth || !elem) {
      return null
    }

    if (elem.className.match(/thing/)) {
      return elem;
    } else {
      return this.parentMatch(elem.parentElement, --depth)
    }
  }

  elementBelow(elem, x, y) {
      elem.hidden = true
      let elemBelow = document.elementFromPoint(x, y)
      elem.hidden = false
      return elemBelow
  }

  updateRelationship(elem, parent, x, y) {
    let g = this.state.spaceThings;
    const elemBelow = this.elementBelow(elem, x, y)
    const dropTarget = elemBelow.closest('.thing')

    console.log('updating childy', g, elem, dropTarget, parent)

    if (parent) {
      if (parent === dropTarget) {
        console.log("SAME SAME SAME SAME")
      } else {
        console.log("DIFFERENT DIFFERENT DIFFERENT", parent.id, elem.id, g, g.edges[parent.id][elem.id])
        // delete edge for oldparent -> elem
        delete g.edges[parent.id][elem.id]
      }

    }

    if (dropTarget) {
      // if no edges exist for target, initialise {}
      if (!g.edges[dropTarget.id])
        g.edges[dropTarget.id] = {}

      // add edge for target -> elem
      g.edges[dropTarget.id][elem.id] = {}
      this.setState({
        spaceThings: g,
      })
    }

    //debugger;
  }

  updateMoving(elem, parent, props) {
    console.log('updateMoving: ', elem, parent)

    let state = {moving: {
      elem: elem,
      x: props.x,
      y: props.y
    }}
    if (parent) {
      let g = this.state.spaceThings;
      delete g.edges[parent.id][elem.id]
      state.spaceThings = g
    }
    this.setState(state)
  }

  // (evt) move
  move(e) {
    e.preventDefault()
    let self = this;
    let elem = this.parentMatch(e.target, 3)
    if (!elem) {
      console.log('move: invalid selection ', e.target)
      return;
    }
    console.log("move:", e)

    let r = elem.getBoundingClientRect()
    let shiftX = e.clientX - r.left;
    let shiftY = e.clientY - r.top;

    // shift to mouse then
    const shift = (page, client, elem) => page - (client - elem)

    let directParent = elem.parentElement
    directParent = (directParent && directParent.closest('.thing')) || null
    console.log('MOVING VALS DEBUG', e, directParent, e.clientY,
                'y epsilom',
               elem.offsetTop)


    let epsilonY = (directParent && elem.offsetTop) || 0
    let epsilonX= (directParent && elem.offsetLeft) || 0
    self.updateMoving(elem, directParent, {
      mouseMove,
      x: e.pageX - shiftX - epsilonX,
      y: e.pageY - shiftY - epsilonY
    })

    styleMoving(elem, true)
    moveAt(elem, e.pageX, e.pageY);

    // bind to docu
    // TODO enclose callbacks with elem as parameter
    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('mouseup', mouseUp)


    let dropzone = null;
    let currentDroppable = null

    // moves the elem at (pageX, pageY) coordinates
    // taking initial shifts into account
    function moveAt(elem, pageX, pageY) {

      elem.style.position = 'absolute';
      elem.style.zIndex = 1000;
      elem.style.left = self.unit(pageX - shiftX - epsilonX)
      elem.style.top = self.unit(pageY - shiftY - epsilonY)
    }

    function styleMoving(el, t) {
      if (!el) return;

      if (t) {
        el.style.transform = 'scale(1.01)'
        elem.style.boxShadow = '.0rem .0rem .1rem .05rem #c7bfa1'
        return
      }
      el.style.transform = ''
      el.style.boxShadow = '.1rem .1rem .1rem #c7bfa1'
    }

    // TODO bounding box for dragging elements in
    // look at hidden element that defers it's gestures nicely
    // anywhere on the element = top in list
    function lookDroppable(el, t) {
      if (!el) return;

      if (t) {
        el.className += ' fauxthing'
        //el.style.outline = 'solid 1px red';
        el.style.height = r.height * 1.25+ "px";
        return
      }
      el.className = 'dropzone'
      el.style.outline = '';
      el.style.height = '';
    }

    function enterDroppable(elem) {
      dropzone = elem
      lookDroppable(dropzone, true)
    }

    function leaveDroppable(elem) {
      dropzone = elem
      lookDroppable(dropzone, false)
    }

    function mouseMove(e) {
      e.preventDefault()

      elem = document.getElementById(elem.id)
      if (!elem) {
        console.log('move, no ELEM!!!!')
        return
      }
      moveAt(elem, e.pageX, e.pageY)

      // TODO investigate using the bounding box to trigger 'droppable'
      let elemBelow = self.elementBelow(elem, e.clientX, e.clientY);
      if (!elemBelow)
        return;

      let droppableBelow = elemBelow.closest('.dropzone');
      if (currentDroppable !== droppableBelow) { // TODO check if strict is okay
        // moving in or out
        //   currentDroppable if we were not over a droppable before this event (e.g over an empty space)
        //   droppableBelow   if we're not over a droppable now, during this event

        if (currentDroppable)
          leaveDroppable(currentDroppable);

        currentDroppable = droppableBelow;

        if (currentDroppable)
          enterDroppable(currentDroppable);
      }
    }

    function mouseUp(e) {
      // destroy events
      //console.log('mouseUp: ', e)

      let c = document.getElementById('container')
      document.removeEventListener('mousemove',mouseMove)
      document.removeEventListener('mouseup', mouseUp)
      c.removeEventListener('mousemove', mouseMove)

      elem.onmousemove = null
      elem.onmouseup = null
      c.appendChild(elem)

      // resize
      elem.style.transform = 'scale(1)'
      lookDroppable(dropzone, false)
      styleMoving(elem, false)
      elem.style.zIndex = ''
      // fix offset to container
      //let s = elem.style.top // "327px", "1028px"
      //elem.style.top = parseInt(s.substring(0, s.length - 2), 10) - c.offsetTop + "px"

      // update state
      self.updateRelationship(elem, directParent, e.clientX, e.clientY)
      self.updatePosition(elem)
      self.setState({moving: null})

      let p = document.createElement('p')
      p.text = 'this one had the mouseUp'
      elem.appendChild(p)
    }
  }

  movePermit(e) {
    // verify elem is droppable
    e.preventDefault() // remove link handling
    console.log('movePermit: ', e)
    e.style.top = this.unit(10)
    e.style.left = this.unit(10)

  }

  unit(v) {
    return  (v + "px")
  }

  // get 'children'
  // - edges[id] -> [children]

  renderThing(n, e, c) {
    c = c || null

    let style = {}

    if (e) {
      style.top = e.y
      style.left = e.x
    } else {
      style.backgroundColor = 'chucknorris'
    }

    if (this.state.moving && this.state.moving.elem.id === n.id.toString()) {
      // TODO clean up `+ 'px'`
      style.top = this.unit(this.state.moving.y)
      style.left = this.unit(this.state.moving.x)
    }

    return (
      <div className={"thing" + ((n.content === ' space' && n.content) || '')}
           id={n.id}
           key={n.id}
           style={style}
           onMouseDown={this.move.bind(this)}
           onDragStart={null}
      >
        <h4>{n.label}</h4>
        <p>{n.data}</p>
        <p><small>{new Date().toLocaleString()}</small></p>

        <div className="mount">
          <div className="dropzone" />
          {c}
        </div>
     </div>
    )
  }

  renderNest(items, node, self, top) {
    // expand children

    if (!node || !items || !self)
      return

    let not_top = [(!top && node) || null]

    // don't render position information if !top
    let edge = (top && items.edges[self.state.currentSpace.id][node]) || null
    let k = items.edges[node]
    if (k) {
      const kids = Object.keys(k)
      if (kids && kids.length > 0) {
        let thing = self.renderThing(
            items.nodes.get(parseInt(node, 10)),
            edge,
            kids.map(e => {
              let {tops, thing} = this.renderNest(items, e, self, false)
              not_top = not_top.concat(tops)
              return thing
            }))

        return {
          tops: not_top,
          thing: thing
        }
      }
    }

    return {
      tops: not_top,
      thing: self.renderThing(items.nodes.get(parseInt(node, 10)), edge)
    }
  }

  renderItems(items) {
    if (!items) return null;
    let col = []
    let not_top = []

    items.nodes.forEach(e => {
      const {tops, thing}  = this.renderNest(items, e.id, this, true)
      not_top = not_top.concat(tops)
      if (not_top.includes(e.id.toString())) return; // render unique top-down
      col.push(thing)
    })

    return col
  }


  // TODO allow multiple
  renderMoving() {
    if (!this.state.moving)
      return

    let {thing} = this.renderNest(this.state.spaceThings, this.state.moving.id, this, true)
    thing.onMouseMove = this.state.moving.mouseMove;
    thing.onMouseUp = this.state.mouseUp;
        thing.style = {
      left: this.state.moving.x + "px",
      top: this.state.moving.y + 'px',
    }
    console.log('render moving:', thing)
    return thing
  }

  render() {

    // TODO rendering of duplicates (indended stuff / quotes)
    // TODO remove, replace (trnasclusion stuff)
    console.log('home, render', this.state.moving)
// {this.renderMoving()}
    return (
      <div id="home">

        <div id="container" style={{height: window.innerHeight * .8 }}>
          <h2 id="currentSpaceName">{this.state.currentSpace.label}</h2>

          {
            this.renderItems(this.state.spaceThings)
          }
        </div>
        <button id="print">print things</button>
        <textarea id='currentspace'
                  readOnly={true}
                  value={JSON.stringify(this.state.spaceThings, null, 4)} style={{height: "500px", width: '500px'}}

        />
      </div>

    );
  }
}

export default Home;
