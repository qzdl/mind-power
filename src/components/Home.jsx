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
        edges: this.state.things.edges}))
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
    e.onmousedown = this.move.bind(this)
    e.ondragstart = () => false
  }

  create(point) {
    console.log('create: ', point, point.target.id)

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

    this.setState({ things: t })
    console.log('updated ', elem.id, ' as', edge)
  }

  navigate(point) {
    console.log('navigate: ', point)
    // TODO disambiguate click & drag movements against container
    // TODO map xy mouse movements to LR/UD scrolling
  }

  parentMatch(elem, depth) {
    console.log('parentMatch: ', depth, elem)
    if (0 >= depth || !elem) {
      return null
    }

    if (elem.className.match(/thing/)) {
      return elem;
    } else {
      return this.parentMatch(elem.parentElement, --depth)
    }
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

    document.body.append(elem);
    styleMoving(elem, true)
    moveAt(e.pageX, e.pageY);

    // moves the elem at (pageX, pageY) coordinates
    // taking initial shifts into account
    function moveAt(pageX, pageY) {
      elem.style.position = 'absolute';
      elem.style.zIndex = 1000;
      elem.style.left = pageX - shiftX + 'px';
      elem.style.top = pageY - shiftY + 'px';
    }

    function styleMoving(el, t) {
      if (!el) return;

      if (t) {
        elem.style.transform = 'scale(1.01)'
        elem.style.boxShadow = '.0rem .0rem .1rem .05rem #c7bfa1'
        return
      }
      elem.style.transform = ''
      elem.style.boxShadow = '.1rem .1rem .1rem #c7bfa1'
    }


    let dropzone = null;
    let currentDroppable = null

    // TODO make the dropzone look nice
    // inserting element at point with respect to order?
    // border left?
    //
    //
    // TODO bounding box for dragging elements in
    // look at hidden element that defers it's gestures nicely
    // anywhere on the element = top in list
    function lookDroppable(el, t) {
      if (!el) return;

      if (t) {
        el.className += ' thing'
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

    function onMouseMove(e) {
      e.preventDefault()
      moveAt(e.pageX, e.pageY)

      // TODO investigate using the bounding box to trigger 'droppable'
      elem.hidden = true;
      let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      elem.hidden = false;

      // mousemove events may trigger out of the window (when the ball is dragged off-screen)
      // if clientX/clientY are out of the window, then elementFromPoint returns null
      if (!elemBelow) return;

      // potential droppables are labeled with the class "droppable" (can be other logic)
      let droppableBelow = elemBelow.closest('.dropzone');
      
      if (currentDroppable != droppableBelow) {
        // we're flying in or out...
        // note: both values can be null
        //   currentDroppable=null if we were not over a droppable before this event (e.g over an empty space)
        //   droppableBelow=null if we're not over a droppable now, during this event

        if (currentDroppable) {
          // the logic to process "flying out" of the droppable (remove highlight)
          leaveDroppable(currentDroppable);
        }
        currentDroppable = droppableBelow;
        if (currentDroppable) {
          // the logic to process "flying in" of the droppable
          enterDroppable(currentDroppable);
        }
      }
    }

    // move the elem on mousemove
    document.addEventListener('mousemove', onMouseMove)

    // drop the element, remove unneeded handlers
    elem.onmouseup = mouseUp
    document.addEventListener('mouseup', mouseUp)

    function mouseUp(e) {
      // destroy events
      let c = document.getElementById('container')
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', mouseUp)
      c.removeEventListener('mousemove', onMouseMove)
      elem.onmousemove = null
      elem.onmouseup = null
      c.appendChild(elem)


      elem.hidden = true;
      let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      elem.hidden = false;
      console.log("NEST IT:", e, elemBelow)

      // fix offset to container
      let s = elem.style.top // "327px", "1028px"
      elem.style.top = parseInt(s.substring(0, s.length - 2), 10) - c.offsetTop + "px"
      // resize
      elem.style.transform = 'scale(1)'
      lookDroppable(dropzone, false)
      styleMoving(elem, false)

      // replace in container
      try {
        document.body.removeChild(elem)
         // fix offset to container
        let s = elem.style.top // "327px", "1028px"
        elem.style.top = parseInt(s.substring(0, s.length - 2), 10) - c.offsetTop + "px"
      } catch(e) {}

      // persist position data
      self.updatePosition(elem)


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
    }

    return (
      <div className={"thing " + (n.content === 'space' && n.content) || ''}
           id={n.id}
           key={n.id}
           style={style}>
        <h4>{n.label}</h4>
        <p>{n.data}</p>

        <div className="mount">
          <div className="dropzone" />
          {c}
        </div>
     </div>
    )
  }

  // TODO recursion for arbitrary nesting
  renderItems(items) {
    if (!items) return null;

    let seen = []

    // with children
    let ks = Object.keys(items.edges).filter(e => e != this.state.currentSpace.id)
    console.log(ks, Object.keys(items.edges))

    let col = []
    let nested  = ks.map(e => {
      const kids =Object.keys(items.edges[e])
      seen = seen.concat(kids.concat([e]))

      const el = items.nodes.get(parseInt(e, 10))
      const ki = kids.map(k => this.renderThing(
        items.nodes.get(parseInt(k, 10))))

      // containing
      return this.renderThing(
        el, items.edges[this.state.currentSpace.id][e], ki)
    }).filter(e => e) // drop nulls

    items.nodes.forEach(e => {
      if (ks.includes(e.id.toString()) || seen.includes(e.id.toString())) return;
      let edge  = items.edges[this.state.currentSpace.id][e.id]
      col.push(this.renderThing(e, edge))
    })

    col = col.concat(nested)
    return col
  }

  render() {

    console.log('home, render')

    return (
      <div className="home">
        <div id="container" style={{height: window.innerHeight * .8 }}>
          <h2 id="currentSpaceName">{this.state.currentSpace.label}</h2>
          {
            this.renderItems(this.state.spaceThings)
          }
        </div>
        <button id="print">print things</button>
      </div>

    );
  }
}

export default Home;
