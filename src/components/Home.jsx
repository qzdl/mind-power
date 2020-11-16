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
//
// }

let initthings = {
  nodes: new Map(),
  edges: []
}

objthings.nodes.forEach(e => {
   initthings.nodes.set(e.id, e)
})

initthings.edges = objthings.edges

initthings.newId = (function() {
  return Math.max(...this.nodes.keys()) + 1
})

class Home extends React.Component {

  state = {
    stack: {},
    shape: {},
    view:  {},
    things: initthings,
    currentSpace: initthings.nodes.get(0),
    spaceThings: this.spaceGraph(initthings, initthings.nodes.get(0))
  }

  handleSpaceChange(space) {
    this.getInfo()
    console.log('ye')
  }

  getInfo() {
    const s = this.spaceGraph(this.state.things, this.state.currentSpace)
    console.log('getInfo: ', s)
    this.setState({
      spaceThings: this.spaceGraph(this.state.things, this.state.currentSpace)
    })
    return s;
  }

  // (evt) edit
  edit(item) {
    console.log('edit: ', item)
    let elem = document.getElementById(item)

    if (!elem)
      return

    let self = this;
    let data = elem.getElementsByClassName('data')[0]
    let editor = document.createElement('textarea')
    editor.className = 'editor what'
    editor.value = data.text || ''
    data.innerHTML = null
    data.appendChild(editor)
    editor.focus()

    editor.onkeyup = function(e) {

      if (e.ctrlKey && e.keyCode === 13) { // exit editing binding
        removeEditor()
      }

    }

    function removeEditor() {
      let t = self.state.things
      let n = t.nodes.get(parseInt(item, 10))
      n.data = editor.value
      t.nodes.set(parseInt(item, 10), n)
      self.setState({editing: undefined})
      self.updateThings(t)

    }
  }

  componentDidUpdate() {
    //if (document.ctx)  document.ctx.position()
    if (this.state.editing)
      this.edit(this.state.editing)
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

    window.addEventListener('contextmenu', this.actions.bind(this))


    let space = document.getElementById('container')
    //let things = document.getElementsByClassName('thing')
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
  }

  addThing(props) {
    const {x, y, data, content, parent, editing} = props
    let t = this.state.things
    let s = this.state.currentSpace
    let n = {
      id: this.state.things.newId(),
      content: content || "block",
      data: data || " ",

    }
    t.edges[s.id][n.id] = {}
    if (parent) {
      let pe = t.edges[parent]
      if (!pe)
        t.edges[parent] = {}
      t.edges[parent][n.id] = {}
    }

    let e = t.edges[s.id][n.id]
    e = {x,y}
    t.nodes.set(n.id, n)
    t.edges[s.id][n.id] = e

    const edit = editing ? {editing: n.id} : {}

    this.setState({
      things: t,
      spaceThings: this.spaceGraph(t, s),
      ...edit
    })
  }

  create(point) {
    console.log('create: ', point, point.target.id)

    if (point.target.id !== 'container')
      return

    this.addThing({x: point.layerX, y: point.layerY})
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
    if (elem)
      elem.hidden = true
    let elemBelow = document.elementFromPoint(x, y)
    if (elem)
      elem.hidden = false
    return elemBelow
  }

  handleClick(e) {
    e.preventDefault()
    switch (e.buttons) {
    case 1:   // left click
      this.move(e)
      break;
    case 2:  // right click
      this.actions(e)
      break;
    case 4: // scroll click
      this.enterSpace(e, this)
      break;
    default: // unhandled
      console.log('handleClick: unhandled button ', e.buttons, e)
      break;
    }
  }

  // (evt) enterSpace
  enterSpace(e, self) {

    console.log('es: ', this, self, self.setState, self.spaceGraph, self.state.currentSpace)
    let elem =  e.target.closest('.thing')
    if (!elem)
      return

    let selectedSpace = self.state.things.nodes.get(parseInt(elem.id, 10))
    if (!selectedSpace || (selectedSpace && selectedSpace.content !== 'space'))
      return

    console.log('enterSpace: ', e, selectedSpace)
    let r = elem.getBoundingClientRect()
    console.log('enterSpace proportions',
                window, r,
                {wh: document.innerHeight,
                 th: r.height,
                 whOth: window.innerHeight / r.height,
                 thOwh: r.height/window.innerHeight},
                {ww: window.innerWidth,
                 tw: r.width,
                 wwOtw: window.innerWidth / r.width,
                 twOww: r.width / window.innerWidth
                })


    const [x, y] =
      [window.innerWidth / r.width,
       window.innerHeight / r.height]
    let style = document.createElement('style')
    style.innerHTML = `
  .zooming {
    z-index: 9999;
    transform-origin: 0 0;
    transition: translate .5s, transform .5s;
    transform: scaleX(${x}) scaleY(${y});
    translate: -${elem.style.left} -${elem.style.top};
  }
    `
    document.body.appendChild(style)
    elem.className += ' zooming'
    setTimeout(onZoomEnd, 500)


    function onZoomEnd(e) {
      self.setState({
        spaceThings: self.spaceGraph(self.state.things, selectedSpace),
        currentSpace: selectedSpace
      })
    }


    /*

      trigger zoom animation

    onzoomend:
      rebind spaceThings to selectedSpace
*/

  }

  // (evt) actions
  actions(e) {
    e.preventDefault() // disable rclick menu
    console.log('ACTION')
    let self = this;

    if (document.ctx)
      return

    let elem = belowThing(e)
    if (!elem)
      return

    let existing = document.getElementById('context')
    if (existing && existing.target === elem.id)
      return

    let ctx = document.createElement('div')
    ctx.id = 'context'
    ctx.className = 'context'
    ctx.target = elem.id
    const c = document.getElementById('container')
    c.appendChild(ctx)

    createButton('[+]', function() {
      self.addThing({parent: ctx.target, editing: true})
      removeContext()
    })
    createButton('" "', null)
    createButton('[i]', function() {
      const j = i => JSON.stringify(i, null, 4) + '\n'
      alert(
        j({ nodes: self.state.things.nodes.get(parseInt(ctx.target, 10)),
            edges: self.state.things.edges[ctx.target]}))
    })

    document.body.addEventListener('mousedown', removeContext)
    document.body.addEventListener('mouseup', removeContext)

    ctx.position = position
    document.ctx = ctx

    // position appropriately
    position()

    ctx.className += ' active'

    function removeContext(ev) {
      console.log('removeContext')

      // keep ctx if !!event, click is on target, or ctx
      if (ev) {
        let below = belowThing(ev)
        if (ev && ev.buttons != 4 && (
          (below && below.id === elem.id) ||
          belowThing(ev, '.context')))
        return
      }


      // fade out
      ctx.className = 'context'
      setTimeout(() => c.removeChild(ctx), 200)

      document.ctx = null
      document.body.removeEventListener('mousedown', removeContext)
      document.body.removeEventListener('mouseup', removeContext)
    }

    function position() {
      if (!ctx)
        return

      const r = ctx.getBoundingClientRect()
      const er = elem.getBoundingClientRect()
      ctx.style.left = self.unit(
        er.left + er.width
      )
      ctx.style.top = self.unit(
        Math.max(
          (e.clientY - r.height / 2),
          (elem.offsetTop))
      )
    }

    function createButton(icon, click) {
      let btn = document.createElement('pre')
      btn.innerHTML = icon
      btn.className = 'button'
      btn.onclick = click
      ctx.appendChild(btn)
    }

    function belowThing(ev, className) {
      if (!className)
        className = '.thing'
      return self.elementBelow(null, ev.clientX, ev.clientY)
                   .closest(className)
    }
  }
  // (evt) move
  move(e) {
    e.preventDefault()
    let self = this;
    let elem = e.target.closest('.thing')
    //let elem = this.parentMatch(e.target, 3)
    if (!elem) {
      console.log('move: invalid selection ', e.target)
      return;
    }
    console.log("move:", e)

    let r = elem.getBoundingClientRect()
    let shiftX = e.clientX - r.left;
    let shiftY = e.clientY - r.top;

    let directParent = elem.parentElement
    directParent = (directParent && directParent.closest('.thing')) || null

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
      elem.style.zIndex = 1000;
      elem.style.left = self.unit(pageX - shiftX - epsilonX)
      elem.style.top = self.unit(pageY - shiftY - epsilonY)

      if (document.ctx && document.ctx.target === elem.id) {
        document.ctx.style.left = self.unit(pageX - shiftX - epsilonX + r.width)
        document.ctx.style.top = self.unit(pageY - shiftY - epsilonY)
      }
    }

    function styleMoving(el, t) {
      if (!el) return;

      if (t) {
        el.style.transform = 'scale(1.01)'
        elem.style.boxShadow = '.0rem .0rem .1rem .05rem #dcdfe5'
        return
      }
      el.style.transform = ''
      el.style.boxShadow = '.1rem .1rem .1rem #dcdfe5'
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

      elem = document.getElementById((elem && elem.id) || '')
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

  // get nodes that reference this node
  spaceParent(space) {
    //const t = this.state.things
    //t.edges // obj
    //this.state.currentSpace // id, label, content
  }

  updatePosition(elem) {
    // things are positioned with respect to a space by their edge
    console.log('updatePosition: ', elem)

    let t = this.state.things
    let edge = t.edges[this.state.currentSpace.id][elem.id];
    [edge.x, edge.y] = [elem.style.left, elem.style.top]
    t.edges[this.state.currentSpace.id][elem.id] = edge;

    console.log('updated ', elem.id, ' as', edge)
    this.updateThings(t)
  }

  updateThings(things) {
    this.setState({
      things,
      spaceThings: this.spaceGraph(things, this.state.currentSpace)
    })
  }

  updateRelationship(elem, parent, x, y) {
    console.log('updateRelationship: ', elem, parent)

    let g = this.state.things;
    const elemBelow = this.elementBelow(elem, x, y)
    const dropTarget = elemBelow.closest('.thing')

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
      this.updateThings(g)
    }

     if (!parent && dropTarget)
       elem.hidden = true;

    //debugger;
  }

  updateMoving(elem, parent, props) {
    console.log('updateMoving: ', elem, parent)

    let state = {
      moving: {
      elem: elem,
      x: props.x,
      y: props.y
      }
    }
    // if has parent, remove relationship
    if (parent) {
      let g = this.state.things;
      delete g.edges[parent.id][elem.id]
      this.updateThings(g)
    }
    this.setState(state)
  }

  // get 'children'
  // - edges[id] -> [children]
  renderThing(n, e, c) {
    c = c || null

    let style = {}

    if (e) {
      style.top = e.y
      style.left = e.x
    } else { // nested
      style.backgroundColor = 'chucknorris'
    }

    if (this.state.moving
     && this.state.moving.elem.id === n.id.toString()) {
      style.top = this.unit(this.state.moving.y)
      style.left = this.unit(this.state.moving.x)
    }

    return (
      <div className={"thing" + ((n.content === ' space' && n.content) || '')}
           id={n.id}
           key={n.id}
           style={style}
           onMouseDown={this.handleClick.bind(this)}
           onDragStart={null}
      >
        <h4>{n.label}</h4>
        <div className="data">{n.data}</div>

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

  render() {
    // TODO export
    // TODO allow for multiple moving
    // TODO shift selection (freehand bounding, box)
    // TODO space preview
    //   thinking about having this as some element that renders a board
    //   flag for BOARD_PREVIEW_RECURSION_DEPTH :: defaulting to 0
    //     where 0 means don't load previews in previews
    //    add .zooming class to preview
    //    - standard zoom: wait {.2s for animation}, then onZoomEnd() to bind
    // TODO disambiguate gestures (rclick, lclick)
    // TODO touch events
    // TODO rendering of duplicates (indended stuff / quotes)
    //   this is happening with really nested items
    // TODO space transition animation
    // TODO space preview
    // TODO fix scrolling offset
    // TODO remove, replace (transclusion stuff)
    // TODO link up fulltext
    // TODO figure out splitting into components
    // TODO figure out react state
    // TODO think about space local modifications
    // TODO ordering
    // TODO editor event
    // TODO figure out local storage
    console.log('home, render', this.state.moving)
    return (
      <div id="home">

        <div id="container" style={{height: window.innerHeight * .8 }}
             onDragOver={(e) => {
               e.preventDefault()
               e.stopPropagation()
               console.log(e)
             }}
             onDrop={(e) => {
               e.preventDefault()
               e.stopPropagation()

               console.log('container drop:', e)
               console.log(e.dataTransfer.items)

               this.addThing({
                 x: e.clientX,
                 y: e.clientY,
                 data: e.dataTransfer.getData('text')
               })

               for (const v in e.dataTransfer.items) {

               }
             }}
        >
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
