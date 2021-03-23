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


*/

import React from "react";
import elasticlunr from "elasticlunr"
import _ from "lodash"
import Settings from './settings'
import Index from './Index'
import Stack from './Stack'
import Thing from './Thing'
import Data from "./data"

let objthings = Data.datamodel

let ftindex =  elasticlunr(function() {
  this.addField('label');
  this.addField('data');
  this.setRef('id');
  this.saveDocuments = true
})

let initthings = {
  nodes: new Map(),
  edges: []
}

objthings.nodes.forEach(e => {
  initthings.nodes.set(e.id, e)
  ftindex.addDoc(e)
})

initthings.edges = objthings.edges

initthings.newId = (function() {
  return Math.max(...this.nodes.keys()) + 1
})

class Home extends React.Component {

  state = {
    ftindex: ftindex,
    stack: {},
    shape: {},
    view:  {},
    things: initthings,
    currentSpace: initthings.nodes.get(0),
    spaceThings: this.spaceGraph(initthings, initthings.nodes.get(0)),
    events: {
      1: { // left click
        thing: this.move,
        c_thing: this.edit,
        space: this.create,
        c_space: this.createSpace
      },
      2: { // right click
        thing: this.actions,
      },
      4: { // scroll
        thing: this.enterSpace,
        c_space: this.home,
        space: this.exitSpace
      }
    }
  }

  handleSpaceChange(space) {
    this.getInfo()
  }

  componentDidUpdate() {
    if (this.state.editing)
      this.edit(null, this.state.editing)
  }

  componentDidMount() {
    if (!this.state.things || Object.keys(this.state.things).length === 0) {
      console.log('mount: things is empty');
      //return 0;
    }
    console.log('mount: ', this.state.things)

    this.mountSpace()
  }

  getInfo() {
    const s = this.spaceGraph(this.state.things, this.state.currentSpace)
    console.log('getInfo: ', s)
    this.setState({
      spaceThings: this.spaceGraph(this.state.things, this.state.currentSpace)
    })
    return s;
  }

  spaceGraph(graph, space) {
    // all nodes E connected to SPACE
    // all nodes A connected to node e from E,
    //   where a from A is connected to SPACE (in E) | as B

    let degreeSpace = {}
    let nodeSpace = new Map()
    let se = graph.edges[space.id] // {}
    if (!se) {
      console.log('empty spacegraph', se, graph, space)

      //nodeSpace.set(space.id, space)
      degreeSpace[space.id] = {}
      return {nodes: nodeSpace, edges: degreeSpace}
    }

    let E = Object.keys(se)        // [""]

    // for each node (E.target), collect (A: edges & nodes) of
    // first degree to E where exists an edge A to space
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

    console.log('nodespace', nodeSpace)
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
      Settings.debug('resize: ', c.style.height)
      this.setState({view: {}})
    })

    // persist
    let pthing = document.getElementById('print_thing')
    let pevent = document.getElementById('print_events')

    pthing.onclick = () => {
      let fucking_javascript = []
      for (const e of this.state.things.nodes.values()) { fucking_javascript.push(e) }
      Settings.debug('mountSpace persist: ',
                     JSON.stringify({
                       nodes: fucking_javascript,
                       edges: this.state.things.edges}, null ,2))
    }
    pevent.onclick = () => {
      console.log(this.state.events)
    }

    let space = document.getElementById('container')
    // mapping view to position in space (TODO scrollable bg)
    // better to use bounding box function for [computed]
    // const [w,h] = [space.style.width, space.style.height]

    // evts
    space.onmousedown = this.handleClick.bind(this)

    // (evt) navigate
    space.ondrag = this.navigate

    window.addEventListener('contextmenu', this.actions.bind(this))
  }

  handleClick(e) {
    console.log('handleClick; begin evt', e)
    e.preventDefault()

    let isThing = e.target.closest('.thing')
    let isContainer = e.target.id === 'container'

    let target = ''
    if (isThing)
      target = 'thing'
    else if (isContainer)
      target = 'space'

    let dispatch = (events, button, target, ev) => {
      let eventgroup = events[button]
      if (!eventgroup)
        return Settings.debug('handleClick: unhandled button ', [button, ev, events])

      let act = eventgroup[target]
      if (ev.ctrlKey) {
        let c_act = eventgroup["c_"+target]
        if (c_act)
          act = c_act
      }

      if (!act)
        return Settings.debug('handleClick: target unhandled', [button, ev, events])

      // exec
      act = act.bind(this)
      act(ev)
      return act
    }

    Settings.debug('handleClick dispatch:', dispatch(this.state.events, e.buttons, target, e))

  }

  home(e) {
    console.log('go home')
  }

  // (evt) edit
  edit(e, item) {
    if (!e && !item)
      return Settings.debug('edit: no way to find the target')

    let elem;
    if (item)
      elem = document.getElementById(item)
    else if (e) {
      elem = e.target.closest('.thing')
      item = elem.id
    }

    if (!elem)
      return Settings.debug('edit: target not found', [e, item])

    let data = elem.getElementsByClassName('data')[0]
    let editor = document.createElement('textarea')

    elem.className += ' editing'
    editor.className = 'editor'

    let value = this.state.things.nodes.get(parseInt(item, 10))
    if (value)
      editor.value = value.data || ''

    data.innerHTML = null
    data.appendChild(editor)
    editor.focus()

    let s = document.createElement('style')
    s.id = 'editor'
    document.body.append(s)
    function makeStyle(h) {
      s.innerHTML = `.editor { height: ${h} !important; }`
    }

    let removeEditor = (ev) => {
      if (!elem || !editor)
        return Settings.debug('edit: cannot remove editor; elem does not exist', [e, item])

      if (ev) {
        let skip = (el) => el && (el === editor || el === elem)
        let eledth = (el) => el && (
          skip(el) || skip(el.closest('.editor')) || skip(el.closest('.thing'))
        )
        // if you click on the editor, or the containing element
        if (eledth(ev.target) || eledth(document.elementFromPoint(ev.clientX, ev.clientY)))
          return
      }

      // update node content
      let t = this.state.things
      let n = t.nodes.get(parseInt(item, 10))
      n.data = editor.value
      t.nodes.set(parseInt(item, 10), n)
      this.updateThings(t, {editing: undefined})
      this.updateIndex(n)

      // remove editor && events
      elem.className = elem.className.replace('editing', '')
      
      try { // i don't have the mental fortitude to fix this stale render issue
        data.removeChild(editor)
        document.body.removeChild(s)
      } catch(e){}

      document.body.removeEventListener('mousedown', removeEditor)
      document.body.removeEventListener('mouseup', removeEditor)
    }

    document.body.addEventListener('mouseup', removeEditor.bind(this))
    document.body.addEventListener('mousedown', removeEditor.bind(this))

    editor.onkeyup = function(e) {
      if (e.ctrlKey && e.keyCode === 13) { // exit editing binding
        removeEditor()
      }

      makeStyle('auto')
      makeStyle(Settings.unit(this.scrollHeight + 20))
    }
  }

  createSpace(point) {
    this.create(point, {content: 'space', label: 'new space'})
  }


  create(point, other) {
    console.log('create: ', point, point.target.id)

    if (point.target.id !== 'container')
      return

    this.addThing({x: point.layerX - 50, y: point.layerY - 50, editing: true, ...other})
  }

  navigate(point) {
    console.log('navigate: ', point)
    // TODO disambiguate click & drag movements against container
    // TODO map xy mouse movements to LR/UD scrolling
  }

  elementBelow(elem, x, y) {
    if (elem)
      elem.hidden = true
    let elemBelow = document.elementFromPoint(x, y)
    if (elem)
      elem.hidden = false
    return elemBelow
  }



  // (evt) enterSpace
  exitSpace(e) {
    if (!this.state.lastSpace)
      return

    this.changeSpace({
      from: this.state.currentSpace,
      to: this.state.lastSpace,
      target: this.container()
    })
  }

  // (evt) enterSpace
  enterSpace(e) {
    let elem =  e.target.closest('.thing')
    if (!elem)
      return

    let selectedSpace = this.state.things.nodes.get(parseInt(elem.id, 10))
    if (!selectedSpace || (selectedSpace && selectedSpace.content !== 'space'))
      return

    this.changeSpace({
      from: this.state.currentSpace,
      to: selectedSpace,
      target: elem,
      zoomin: true
    })
  }

  container() {
    return document.getElementById('container')
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
    createButton("[x]", function() {
       // TODO delete
    })

    // bind transient context events
    document.body.addEventListener('mousedown', removeContext)
    document.body.addEventListener('mouseup', removeContext)

    ctx.position = position
    document.ctx = ctx

    let container = this.container()
    // position appropriately
    position()

    ctx.className += ' active'

    function removeContext(ev) {
      console.log('removeContext')
      // keep ctx if !!event, click is on target, or ctx
      if (ev) {
        let below = belowThing(ev)
        if (ev && ev.buttons !== 4 && (
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
      ctx.style.left = Settings.unit(
        er.left + er.width
      )
      ctx.style.top = Settings.unit(
        Math.max(
          (e.clientY - r.height / 2 - container.offsetTop),
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

    let c = document.getElementById('container')

    let epsilonY = ((directParent && elem.offsetTop) || 0) + c.offsetTop
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
      elem.style.left = Settings.unit(pageX - shiftX - epsilonX)
      elem.style.top = Settings.unit(pageY - shiftY - epsilonY)

      if (document.ctx && document.ctx.target === elem.id) {
        document.ctx.style.left = Settings.unit(pageX - shiftX - epsilonX + r.width)
        document.ctx.style.top = Settings.unit(pageY - shiftY - epsilonY)
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
      // let s = elem.style.top // "327px", "1028px"
      // elem.style.top = parseInt(s.substring(0, s.length - 2), 10) - c.offsetTop + "px"

      // update state
      self.updateRelationship(elem, directParent, e.clientX, e.clientY)
      self.updatePosition(elem)
      self.setState({moving: null})
    }
  }

  addThing(props) {
    const {x, y, data, content, label, parent, editing} = props
    let t = this.state.things
    const s = this.state.currentSpace
    let n = {
      id: this.state.things.newId(),
      content: content || "block",
      data: data || " ",
      label: label || null
    }

    // bind NODE to SPACE
    let ed = t.edges[s.id]
    if (!ed) t.edges[s.id] = {}
    t.edges[s.id][n.id] = {}

    // bind NODE to ?PARENT
    if (parent) {
      let pe = t.edges[parent]
      if (!pe)
        t.edges[parent] = {}
      t.edges[parent][n.id] = {}
    }

    // register NODE
    t.nodes.set(n.id, n)

    // bind SPACE:NODE properties
    t.edges[s.id][n.id] = {x, y}

    // prepare additional state updates
    const edit = editing ? {editing: n.id} : {}

    let i = this.state.ftindex;
    i.addDoc(n)

    // rebind state (triggers update)
    this.updateThings(t, {
      ftindex: i,
      ...edit
    })
  }

  updateIndex(n) {
    this.state.ftindex.updateDoc(n)
  }

  updatePosition(elem) {
    // things are positioned with respect to a space (space->thing edge property)
    let t = this.state.things
    let edge = t.edges[this.state.currentSpace.id][elem.id];
    [edge.x, edge.y] = [elem.style.left, elem.style.top]
    t.edges[this.state.currentSpace.id][elem.id] = edge; // assuming space->node exists...

    // rebind state (triggers update)
    this.updateThings(t)
  }

  updateThings(things, other) {
    this.setState({
      things,
      spaceThings: this.spaceGraph(things, this.state.currentSpace),
      ...other
    })
  }

  updateRelationship(elem, parent, x, y) {
    console.log('updateRelationship: ', elem, parent)

    // deep copy, so we can delete and rebind according to the rebder lifecycle
    // a digusting reminder that half of these problems wouldn't exist if
    // we were using persistent datastructures

    let g = _.clone(this.state.things);
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

    if (dropTarget) { // adding a new parent->child for 'dropTarget'->'elem'
      // if no edges exist for target, initialise {}
      if (!g.edges[dropTarget.id])
        g.edges[dropTarget.id] = {}

      // add edge for target -> elem
      g.edges[dropTarget.id][elem.id] = {}

    }

     if (!parent && dropTarget)
       elem.hidden = true;

    this.updateThings(g)
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

  changeSpace(props) {
    /* trigger zoom animation

    onzoomend:
      rebind spaceThings to selectedSpace
    */
    const {from, to, target, zoomin} = props

    let style = document.createElement('style')
    style.id = 'zooms'
    if (zoomin && target) {
      const r = target.getBoundingClientRect()
      const [x, y, left, top] =
        [window.innerWidth / r.width,
         window.innerHeight / r.height,
         target.style.left, target.style.right]

      style.innerHTML = `.zooming {
        transform: scaleX(${x}) scaleY(${y});
        translate: -${left} -${top};
      }`
    } else
      style.innerHTML = `.zooming {
        transform: scale(-.8);
      }`

    document.body.appendChild(style)
    target.className += ' zooming'
    let id = target.id;

    let onZoomEnd = (e) => {
      this.setState({
        lastSpace: from,
        spaceThings: this.spaceGraph(this.state.things, to),
        currentSpace: to
      })

      let rstyle = document.getElementById('zooms')
      if (rstyle)
        document.body.removeChild(rstyle    )
      let elem = document.getElementById(id)
      if (elem)
        elem.className = elem.className.replace('zooming', '')
    }

    setTimeout(onZoomEnd, 500)
}


  renderNest(items, node, self, top) {
    if (!node || !items || !self)
      return

    let not_top = [(!top && node) || null]

    // don't render position information if !top
    let edge = (top && items.edges[self.state.currentSpace.id][node]) || null
    let k = items.edges[node]
    if (k) {
      const kids = Object.keys(k)
      if (kids && kids.length > 0) {
        let thing =
          <Thing
            node={items.nodes.get(parseInt(node, 10))}
            edge={edge}
            children={kids.map(e => {
              let {tops, thing} = this.renderNest(items, e, self, false)
              not_top = not_top.concat(tops)
              return thing
            })} />

        return {
          tops: not_top,
          thing: thing
        }
      }
    }

    return {
      tops: not_top,
      thing: <Thing node={items.nodes.get(parseInt(node, 10))}
                    edge={edge} />
    }

  }


  renderItems(items) {
    console.log('renderItems, empty', items)
    if (!items || (items && (!items.edges || !items.nodes))) return null;
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
    // TODO export :wayoff:
    // TODO check thing multiple render
    // TODO allow for multiple moving :refactor:evt:
    // TODO shift selection (freehand bounding, box) :evt:
    // TODO space preview :view:render:refactor:
    //   thinking about having this as some element that renders a board
    //   flag for BOARD_PREVIEW_RECURSION_DEPTH :: defaulting to 0
    //     where 0 means don't load previews in previews
    //    add .zooming class to preview
    //    - standard zoom: wait {.2s for animation}, then onZoomEnd() to bind
    // DONE disambiguate gestures (rclick, lclick) :evt:
    // TODO disambiguate gestures across container <-> thing :evt:
    // TODO drag selection :evt:
    // TODO touch events :evt:
    // TODO rendering of duplicates (indended stuff / quotes) :render:datamodel:
    //   this is happening with really nested items
    //   i think the mechanic for quotes will fix this; one occurance of a thing per board, quoting of [collections of things, parts of things]

    // TODO space transition animation :view:
    // TODO space preview :view:
    // DONE fix scrolling offset :view:
    // TODO remove, replace (transclusion stuff) :datamodel:
    // DONE link up fulltext :integration:
    // TODO look at some data caching https://github.com/weixsong/elasticlunr.js#4-update-a-document-in-index :datamodel:
    // TODO fulltext results container :render:view:integration:
    // TODO figure out splitting into components :refactor:
    // TODO figure out react state :refactor:
    // TODO think about space local modifications :datamodel:
    // TODO ordering :datamodel:rendering:
    // DONE editor event :event:
    // TODO 'data' parser; expand [[link]] and {{function}}
    // TODO space context menu
    //      - settings
    //      - new thing
    //
    //      - new space
    // TODO figure out local storage :refactor:datamodel:integration:
    // TODO figure out duplicate render
    console.log('home, render', this.state.moving)

    return (
      <div id="home">

        <div className="bar">
          <Index things={this.state.things}
                 ftindex={this.state.ftindex} />
          <Stack things={this.state.stack}
                 current={this.state.currentSpace}
                 last={this.state.lastSpace} />

        </div>
        <div id="container" style={{height: window.innerHeight * .8 }}
             onDragOver={(e) => {
               e.preventDefault()
               e.stopPropagation()
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
                 let el = document.createElement('pre')
                 el.innerHTML = JSON.stringify(v, null, 4) + "\n\n" + JSON.stringify(e.dataTransfer.types)
                 document.body.append(el)
               }
             }}
        >
          <h2 id="currentSpaceName">{this.state.currentSpace.label}</h2>

          {
            this.renderItems(this.state.spaceThings)
          }
        </div>
        <button id="print_thing">print things</button>
        <button id="print_events">print events</button>
      </div>

    );
  }
}

export default Home;
