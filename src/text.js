import graphlib from  './graph'
import settings from './settings'

//let boy = buildNode("delimited by _distance_ to next paragraph,");
// addNode(data, boy);
// addEdge(data, buildEdge(boy, getNodeByName(data, "Circle1")[0]));

// TODO regex tests
// TODO 'smart' text pattern recognition like hyperbole (file, twitter,
//      github, custom pattern specifier API)
// TODO can these regexps generated from heuristics (emergent) from the text?
let re_paragraph = /\n\s*\n/;
// from lisp-fill-paragraph (lisp-mode.el) for elisp
let re_paragraph_alt = /\|\s-*".*[,.]$/;

// "\\|\\s-*\\([(;\"]\\|\\s-:\\|`(\\|#'(\\)" paragraph separate from lisp-mode.el

// preceding whitespace, trailing non whitespace char for opening SURROUND
// preceding non-whitespace char, trailing whitespace for closing SURROUND
let re_italic = /\s\/[^\s]([^/]+)[^\s]\/\s/g;
let re_underline = /\s_[^\s]([^_]+)[^\s]_\s/g;

// just match (inner) pattern of SURROUND
let re_parens = /\(([^()]+)\)/g;
let re_sq_parens = /\[([^[\]]+)\]/g;
let re_pipe = /\|([^|]+)\|/g;

// header regexp https://github.com/200ok-ch/organice/blob/2478c578cfede6d3ad9d289ae390462d0bc76620/src/lib/parse_org.js#L832
let re_header = /\n\*+ /g
// what are the implication of combining these as a group?
// - exclusivity & patterns wont be hit if previous pattern yields a match
// - runtime? with/without /g
let re_interesting = /(\s\/[^\s]([^/]+)[^\s]\/\s)|(\(([^()]+)\))|(\[([^[\]]+)\])|(\|([^|]+)\|)/g;

function blocks_text(t, r) {
  return t.split(r);
}

function interesting(t) {
  return t.match(re_interesting);
}

function parse_bullets(t) {
  let g = {nodes:[], edge:[]}
  
  let lines = t.split(/\n/g)
  let idx = 0
  return lines.map(function(e) {
    // if bullet
    
    // if (e.match(/^\s*([-]|[*]|[+]|[0-9]+\.)+/)) {
    //   let a = e.match(/^\s*/g)[0]
    //   return {idx: idx++, sent: e, wsl: a.length, ws: a}
    // } else return {idx: idx++}
  
    return e.match(/^\s*([-]|[*]|[+]|[0-9]+\.)+/) 
      ? e.match(/^\s*/g)[0].length 
      : -1
  })
  
}


// TODO collapsing function ('to doc') :func:

// TODO doc_graph :func:
// build graph for input document as string
//   TODO what to do about headings 
//   TODO add order / weight thing (should it be on an edge?)
//        - i would argue yes, as it is a property of the relationship
//          between a block and it's demarcation
//        - should some weight be given by 'blocks_text'?

//  it is infeasible to have a big recursive depth for this here, 
//  so it might be better to annotate the nodes optimistically, and 
//  dispatch split/match patterns according to those annotations with 
//  some fallback to re_paragraph
function doc_graph(t, name, g=null) {
  g = g || {
    nodes: [],
    edges: [],
    group: null
  };

  let n_demarcation = graphlib.buildNode(name);
  n_demarcation.type = settings.node_type.demarcation;
  g.nodes.push(n_demarcation);

  let cands = blocks_text(t, re_paragraph);
  let idx = 0;

  g.group = {
    groupId: 'group1',
    title: { text: name },
    nodes: cands.map(function (e) {
      let n = graphlib.buildNode(e);
      n.type = 'paragraph'
      let ne = graphlib.buildEdge(n_demarcation, n);
      ne.order = idx++;
  
      e.split(/\n/g).map(
        e => e
      )
      g.nodes.push(n);
      g.edges.push(ne);
  
      // bullet points (FIXME exclusive)
      // let b = e.split(/\n\s*([-]|[*]|[+]|[0-9]+\.)+/g)
      // b && b.map(function (d) {
      //   let a = graphlib.buildNode(d);
      //   a.type = settings.node_type.speculative;
      //   g.nodes.push(a);
      //   g.edges.push(graphlib.buildEdge(n, a));
      // });
  
      
      // speculative
      let s= interesting(e)
      s && s.map(function (d) {
        let a = graphlib.buildNode(d);
        a.type = settings.node_type.speculative;
        g.nodes.push(a);
        g.edges.push(graphlib.buildEdge(n, a));
      });

      return n.id
  })};

  return g;
}

export default {
  blocks_text,
  interesting,
  doc_graph,
  parse_bullets,
  re_paragraph,
  re_interesting
};
