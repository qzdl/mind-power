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


let objthings = {
      nodes: [
        {
          id: '0',
          label: 'home',
          content: 'space'
        },
        {
          id: '1',
          label: 'mind power data model',
          content: 'space'
        },
        {
          id: '2',
          data: 'a space; an explicit organisation of things, with a name',
          content: 'block'
        },
        {
          id: '3',
          data: 'has some data:',
          content: 'block'
        },
        {
          id: '4',
          data: 'shape: dimensions of the space',
          content: 'block'
        },
        {
          id: '5',
          data: 'view: the part of the space being seen (x y)',
          content: 'block'
        },
        {
          id: '6',
          data: 'things: a list of things with positional information',
          content: 'block'
        },
        {
          id: '7',
          data: 'stack:  a stack/tree of breadcrumbs of places past',
          content: 'block'
        },
        {
          id: '8',
          data: 'has some gestures:',
          content: 'block'
        },
        {
          id: '9',
          data: 'create: add a new /thing/',
          content: 'block'
        },
        {
          id: '10',
          data: 'conjoin: add /things/ from the /index/',
          content: 'block'
        },
        {
          id: '11',
          data: 'reflect: view /interesting/ things about your /context/',
          content: 'block'
        },
        {
          id: '12',
          data: 'navigate: move around the /space/',
          content: 'block'
        },
        {
          id: '13',
          data: 'place:    move things around the /space/',
          content: 'block'
        },
        {
          id: '14',
          data: 'exit:     get out of the given /thing/',
          content: 'block'
        },
        {
          id: '15',
          data: 'enter:    go into a given /thing/',
          content: 'block'
        },
        {
          id: '16',
          data: 'inspect:  get information from a /thing/',
          content: 'block'
        },
        {
          id: '17',
          data: 'focus:    select /things/',
          content: 'block'
        },
        {
          id: '18',
          data: 'a thing; a visual & behavioural unit as an abstraction on levels of information',
          content: 'block'
        },
        {
          id: '19',
          data: ' space: see space; "an explicit organisation of things, with a name"',
          content: 'block'
        },
        {
          id: '20',
          data: 'block: some demarcation of drawing or text',
          content: 'block'
        },
        {
          id: '21',
          data: 'quote: some part of a block',
          content: 'block'
        },
        {
          id: '22',
          data: 'behaviour can be dispatched according to these types',
          content: 'block'
        },
        {
          id: '23',
          data: `
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
  go to the /space/ containing the original definition, and /focus/`,
          content: 'block'
        },
        {
          id: '24',
          data: 'inspiration:',
          content: 'block'
        },
        {
          id: '25',
          data: 'mercuryos: https://mercuryos.com/',
          content: 'block'
        },
        {
          id: '26',
          data: 'semilattice:  https://semilattice.xyz/',
          content: 'block'
        },
        {
          id: '27',
          data: 'muse:         https://museapp.com/',
          content: 'block'
        },
        {
          id: '28', data: ' roamresearch: https://roamresearch.com/', content:
          'block' },
        {
          id: '29',
          data: 'org-roam: https://orgroam.com/',
          content: 'block'
        },
        {
          id: '30',
          data: 'emacs-freex:  https://github.com/gdetre/emacs-freex/',
          content: 'block'
        },
        {
          id: '31',
          data: 'graphbrain:   https://github.com/graphbrain/graphbrain/',
          content: 'block'
        },
        {
          id: '32',
          data: 'memex:        https://github.com/steve-1820/memex',
          content: 'block'
        },
        {
          id: '33',
          data: 'research:',
          content: 'block'
        },
        {
          id: '34',
          data: 'Augmenting Human Intellect: A Conceptual Framework https://www.dougengelbart.org/content/view/138',
          content: 'block'
        },
        {
          id: '35',
          data: 'Semantic Hypergraphs TODO',
          content: 'block'
        }
      ],
  edges: [
    { source: '1',  target:  '3' }, { source: '33', target: '34' },
    { source: '33', target: '35' }, { source: '24', target: '25' },
    { source: '24', target: '26' }, { source: '24', target: '27' },
    { source: '24', target: '28' }, { source: '24', target: '29' },
    { source: '24', target: '30' }, { source: '24', target: '31' },
    { source: '24', target: '32' }, {source: '1', target: '35'}
  ]
}

let initthings = {
  nodes: new Map(),
  edges: new Map()
}

objthings.nodes.map(e => {
   initthings.nodes.set(e.id, e)
})

objthings.edges.map(e => {
  initthings.edges.set(e.source+','+e.target, e)
})

console.log('initthings: ',initthings)


class Home extends React.Component {

  state = {
    stack: {},
    shape: {},
    view:  {},
    things: initthings,
    currentSpace: initthings.nodes.get('1')
  }

  componentDidMount() {
    if (!this.state.things || Object.keys(this.state.things).length === 0) {
      console.log('mount: things is empty');
      //return 0;
    }
    console.log('mount: ', this.state.things)

    let currentSpace = this.state.things.nodes.get('1')
    this.setState({currentSpace})

    // worst-case O(n+m)
    let m = new Map();
    let E = this.state.things.edges.forEach(e => {
      if (e.source === currentSpace.id) {
        m.set(e.source, e)
        m.set(e.target, e)
      }
    })

    let c = new Map()
    const k = m.keys()
    this.state.things.nodes.forEach(e => {
      for (const item of k) {
        console.log('join key: ', item)
        if (item === e.id) {
          c.set(e.id, e)
        }
      }
    })

    console.log('join: ', c)
    this.mountSpace()

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

    // mapping view to position in space (TODO scrollable bg)
    // better to use bounding box function for [computed]
    const [w,h] = [space.style.width, space.style.height]

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

  spaceThings(space) {
  // get things for a given space
  }

  updatePosition(elem) {
    // things are positioned with respect to a space by their edge
    console.log('updatePosition: ', elem)

    let t = this.state.things;
    let eid = this.state.currentSpace.id+","+elem.id;

    console.log('ud: ', eid, t);
    let edge = t.edges.get(eid);
    [edge.x, edge.y] = [elem.style.left, elem.style.top]
    t.edges.set(eid, edge)
    this.setState({ things: t })

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

    moveAt(e.pageX, e.pageY);

    // moves the elem at (pageX, pageY) coordinates
    // taking initial shifts into account
    function moveAt(pageX, pageY) {
      elem.style.position = 'absolute';
      elem.style.zIndex = 1000;
      elem.style.left = pageX - shiftX + 'px';
      elem.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      e.preventDefault()
      moveAt(e.pageX, e.pageY)
    }

    // move the elem on mousemove
    document.addEventListener('mousemove', onMouseMove);

    // drop the element, remove unneeded handlers
    elem.onmouseup = function() {
      document.removeEventListener('mousemove', onMouseMove);
      elem.onmouseup = null;

      // replace in container
      document.body.removeChild(elem)
      let c = document.getElementById('container')
      c.appendChild(elem)

      // fix offset to container
      let s = elem.style.top // "327px", "1028px"
      elem.style.top = parseInt(s.substring(0, s.length - 2)) - c.offsetTop + "px"
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

  renderItems() {
    let c = []
    this.state.things.nodes.forEach(e => {
      console.log('rednerItems: ', e)
      c.push(<div
               className={"thing " + (e.content === 'space' && e.content) || ''}
               id={e.id}>
        <h4>{e.label}</h4>
        <p>{e.data}</p>
             </div>)

    })
    return c
  }

  render() {
    console.log('home, render')

    return (
      <div className="home debug">
        <div id="container" style={{height: window.innerHeight * .8 }}>
          <h2 id="currentSpaceName">{this.state.currentSpace.label}</h2>
          {
            this.renderItems()
          }
        </div>
        <button id="print">print things</button>
      </div>

    );
  }
}

export default Home;
