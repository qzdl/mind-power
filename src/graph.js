import G6 from "@antv/g6";
import settings from  "./settings"

let addedCount = 0;

// TODO determine imode by nature of interaction
const interactive_modes = [
  { label: "Arrange", value: "default" },
  { label: "Add Node", value: "addNode" },
  { label: "Add Edge", value: "addEdge" }
];

// custom behaviour
G6.registerBehavior("click-add-edge", {
  getEvents() {
    return {
      "node:click": "onClick",
      mousemove: "onMousemove",
      "edge:click": "onEdgeClick"
    };
  },
  onClick(ev) {
    const node = ev.item;
    const graph = this.graph;
    const point = {
      x: ev.x,
      y: ev.y
    };
    const model = node.getModel();
    if (this.addingEdge && this.edge) {
      graph.updateItem(this.edge, {
        target: model.id
      });
      // graph.setItemState(this.edge, 'selected', true);
      this.edge = null;
      this.addingEdge = false;
    } else {
      this.edge = graph.addItem("edge", {
        source: model.id,
        target: point
      });
      this.addingEdge = true
    }
    console.log('click add edge')

  },
  onMousemove(ev) {
    const point = {
      x: ev.x,
      y: ev.y
    };
    if (this.addingEdge && this.edge) {
      this.graph.updateItem(this.edge, {
        target: point
      });
    }
  },

  onEdgeClick(ev) {
    const currentEdge = ev.item;
    // 拖拽过程中，点击会点击到新增的边上
    if (this.addingEdge && this.edge === currentEdge) {
      this.graph.removeItem(this.edge);
      this.edge = null;
      this.addingEdge = false;
    }

  }
});

// Register a custom behavior to add node
G6.registerBehavior("click-add-node", {
  getEvents() {
    return {
      "canvas:click": "onClick",
      afterlayout: "afterLayout"
    };
  },
  onClick(ev) {
    console.log('add node canvas click')
    const graph = this.graph;
    let node = buildNode('NEW NODE')
    this.graph.addItem("node", node);

    console.log(node.id, node, SELECTED_ITEM)
    console.log(setFocusItemId(node.id), SELECTED_ITEM)
    // redraw
    graph.layout();
  },
  afterLayout() {
   // focus(this.graph)
  }

});


// TODO RESET graph layout
let SELECTED_ITEM = null;

function setFocusItemId(i) {
  SELECTED_ITEM = i
  return SELECTED_ITEM
}

function focus(graph) {
  let node = graph.findById(SELECTED_ITEM)
  console.log(node, node.x, node.y)
  node && graph.focusItem(node, true, {
    easing: 'easeCubic',
    duration: 500,
  });
}

const dagre = {
  type: 'dagre', // radial, force, concentric
  rankdir: 'LR',
  // align: 'UL',
  nodeSep: 10,
  ranksep: settings.line_length * 2,
  nodeSize: 10,
}

const radial = {
  type: 'radial',
  //center: [100,100],
  // align: 'UL',
  // nodeSize: 100,
  // nodeSpacing: settings.line_length * 10,
  // unitRadius: settings.line_length,
  // preventOverlap: true,
  // strictRadial: false,

  unitRadius: 70,
    maxIteration: 1000,
    linkDistance: 100,
    preventOverlap: true,
    nodeSize: 100,
    sortBy: 'order',
    sortStrength: 0,
}

const circle = {
  type: "circular",

}

const concentric = {
  type: 'concentric',
  center: [500, 500],
  nodeSize: 100,
  radius: 500,
}

const compactBox = {
  type: 'compactBox',
  direction: 'H' // 'TB' / 'BT' / 'LR' / 'RL' / 'H' / 'V'
}

const dendrogram = {
  type: 'dendrogram', // Layout type
  direction: 'LR', // Layout direction is from the left to the right. Options: 'H' / 'V' / 'LR' / 'RL' / 'TB' / 'BT'
  nodeSep: 50, // The distance between nodes
  rankSep: 100, // The distance between adjacent levels
}

let makeTreeGraph = () =>
  new G6.TreeGraph({
  container: 'container',
  modes: {
    default: [
      {
        // Assign the collapse/expand behavior
        type: 'collapse-expand',
      },
      'drag-canvas',
    ],
  },
  // Assign the layout
  layout: compactBox
});

const fisheye = new G6.Fisheye({
  trigger: 'mousemove',
  d: 2,
  r: 300,
  //delegateStyle: clone(lensDelegateStyle),
  showLabel: true,
  showDPercent: false
});

const minimap = new G6.Minimap({
  size: [150, 100],
});

G6.registerNode(
  'dom-node',
  {
    draw: (cfg: ModelConfig, group: Group) => {
      return group.addShape('dom', {
        attrs: {
          width: cfg.size[0],
          height: cfg.size[1],
          // DOM's html with onclick event
          html: `
        <div onclick="alert('Hi')" >
         <h4>${cfg.label || ''}</h4>
   
          <div style="height: 100%; width: 100%;">
            ${cfg.data}
          </div>

        </div>
          `,
          draggable: true,
        },
        name: 'dom-node',
        draggable: true,
      });
    },
  },
  'single-node',
);

// TODO zoom (plugin?)
let makeGraph = () =>
  new G6.Graph({
    container: "container",
    width: window.innerWidth * .9,
    height: window.innerHeight * .9,
    fitView: true,
    animate: true,
    renderer: 'svg',
    layout: dagre,
    modes: {
      default: ["drag-node", "zoom-canvas",],   //"drag-canvas", "click-select"],
      addNode: ["click-add-node", "click-select"],
      addEdge: ["click-add-edge", "click-select"]
    },
    defaultNode: {
      type: "dom-node",
      size: [200, 200], // TODO node size to content https://g6.antv.vision/en/docs/manual/middle/elements/shape/shape-keyshape
    },
    defaultEdge: {
      style: {
        stroke: "#e2e2e2"
      }
    },
    // The node styles in different states
    // nodeStateStyles: {
    //   // The node styles in selected state, corresponds to the built-in click-select behavior
    //   selected: {
    //     stroke: "#666",
    //     lineWidth: 2,
    //     fill: "steelblue"
    //   }
    // },
    plugins: [minimap]
  });

let makeSubGraph = () => new G6.Layout['force']({

});

let initSubGraph = (g,n,e) => {
  g.init({nodes:n,edges:e})
}

function addGraph(g, i, o) {
  g[i].push(o);
  return g;
}
function addNode(g, n) {
  //g.addItem("node", n);
  return n;
}

function addEdge(g, n) {
  return addGraph(g, "edges", n);
}

function buildNode(t, id = null, x = null, y = null) {
  return {
    id: id || `node-${++addedCount}`,
    label: settings.label(t),
    data: t
  };
}

function buildEdge(s, t) {
  return {
    source: s["id"],
    target: t["id"]
  };
}

function getNodeByName(d, n) {
  return d["nodes"]
    .map(e => ((e.id === n || e.label === n) && e) || null)
    .filter(e => e);
}

// FIXME: my lord this is an accident waiting to happen
function mergeGraphs(a, b) {
  return {
    nodes: a.nodes + b.nodes,
    edges: a.edges + b.edges
  };
}

export default {
  makeGraph,
  makeTreeGraph,
  makeSubGraph,
  initSubGraph,
  addGraph,
  addNode,
  addEdge,
  buildNode,
  buildEdge,
  getNodeByName,
  mergeGraphs,
  interactive_modes
};
