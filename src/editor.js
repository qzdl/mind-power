import graph from "./graph"
import text from "./text"
import settings from "./settings"

let b = `
#+SETUPFILE:./hugo_setup.org
#+HUGO_SECTION: zettels
#+HUGO_SLUG: information_and_the_universe
#+TITLE: Information and the Universe

With regard to [[file:20201019T141648Z-notetaking.org][note-taking]], analysis, and the involvement of 'external data
sources' as a monad for the universe. This is an [[file:20200612T111010Z-idea.org][idea]], and / or a [[file:20200609T132052Z-projects.org][Project]].

* [[file:20200410185030-focus_question.org][Focus Question]]s
- what are desirable properties and behaviours of workable information?
  - when it was made
  - where it came from
  - what are the other versions of it
  - what is it similar to
- what are desirable properties of the system(s) to manage this information?
  - input mechanisms
    - [[file:20200401202711-emacs.org][emacs]]
  - [[id:14bc5f78-fa8f-4891-8e25-4598b7604468]['Share' backends]]
  - [[id:4502c59a-05d0-40fd-b0f7-edcda8e360d9][How can we reference specific pieces of External Data?]]
  - extensible, like [[file:20201018T142401Z-karlicoss_hpi_human_programming_interface.org][karlicoss/HPI: Human Programming Interface 🧑👽🤖]]
- what are some existing projects that have novel ideas?
  - [[file:20201018T144628Z-building_a_memex_andrew_louis.org][Building a Memex | Andrew Louis]]
  - [[file:20201018T142401Z-karlicoss_hpi_human_programming_interface.org][karlicoss/HPI: Human Programming Interface 🧑👽🤖]]
  - [[file:20200401202402-org_roam.org][org-roam]]
  - [[file:20200401203026-roam.org][roam]]
  - [[id:da606b08-1dcc-465e-9102-356ed2fb89f6][non-semantic, non-structural ranges]]
  - [[file:20201021T075310Z-grakn.org][grakn]]
    - inference rules, embedding some datalog for rule propagation
    - seems like domains must be known and encoded ahead of data load with
      schema.
- what is some research around this area of information representation
  - https://arxiv.org/pdf/1908.10784.pdf
  - [[file:20201019T113206Z-tf_iduf_a_novel_term_weighting_scheme_for_user_modeling_based_on_users_personal_document_collections.org][TF-IDuF:
    A Novel Term-Weighting Scheme for User Modeling based on Users’ Personal
    Document Collections]]
  - [[file:20200515T082816Z-org_roam_network_analysis.org][Org-Roam Network Analysis]]

* Basically what i think about things

- what do I mean by notetaking (operationalise)
  - like feynman, a thought process
  - recording facts about the world, and their relationships
  - systems for remembering
    - flashcards (anki, org-drill, etc)
  - for me, also graphical things
    - system diagrams
    - topologies
    - ontologies, taxonomy
  - hard work is important, but that doesn't mean that every part of the
    experience should be hard in equal proportion
- what is the experience?
  - paper
    - accessible, but in most cases, lower order, no easy way to follow a protocol
    - not machine readable, which might be okay, depending on who you are, and
      that which you consider ephemeral garbage
    - the data is natural language, and arbitrary graphics
    - can be shared pretty easily
  - onenote
    - handdrawing, typing, cell structure
    - proprietary, garbage, locked up cloud
    - much the same as other platforms - I would consider these as equal; pages,
      evernote, notion
    - sharing is usually okay, and as no reference system exists, you're
      probably copying & pasting everything in, or have some nightmare ETL
      reconciliation script like the ruby guys from the zettelkasten forum
  - roam / etc
    + a graph! a real cognitive leap
    + associative navigation is nice (n-ary context > category)
    + but everything is still lower order
  - so what's next?
    + text analysis
    + higher order objects (types? direction? recursion? composition?)
    + completion mechanism based on what you're looking at
    + make easy things automated
      - topic modelling, textrank on incoming data
    + extensible external data connectors / protocol
    + sharing, collaboration
    + arbitrary embeddings (transclusion)
* links for greg
a complete link dump, but this might give some context to the sort of stuff I
was talking about (methods, datastructures)

`;

let data = {
  nodes: [
    {
      id: "node1",
      label: "Circle1\ndirkle"
    },
    {
      id: "node2",
      label: "Circle2"
    }
  ],
  edges: [
    {
      source: "node1",
      target: "node2"
    }
  ]
};

//  <div id="container" />

//     <div id="editor-container">
//     <h2>Selected Node: <em id="selectedNode">none</em></h2>
//     <textarea id="editor"></textarea>
//   <pre id="output"></pre>
// </div>

// populate picker
function populatePicker(d, p, l = (e) => e.label, v = (e) => e) {
  return d.map(function (e) {
    let o = document.createElement("option");
    o.text = l(e);
    o.value = v(e);
    p.options.add(o);
    return o;
  });
}

// render testing stuff
let picker = document.createElement("select");
document.body.appendChild(picker);

let modes = document.createElement("select");
document.body.appendChild(modes);

let mygraph = graph.makeGraph();

let selected = document.getElementById("selectedNode")
let editor = document.getElementById("editor");
let output = document.getElementById("output"); 
let sg = graph.makeSubGraph();

editor.addEventListener("keyup", (ev) => {
  console.log(ev.keyCode);
  if (ev.keyCode === 32) {
    // space
  let tg = text.doc_graph(editor.value, "input field")
    output.innerHTML = JSON.stringify(tg, null, 2)
   
  tg.nodes.map(e => mygraph.addItem('node', e))
  tg.edges.map(e => mygraph.addItem('edge', e))
  mygraph.refreshPositions();
  }

});

// mygraph.on('node:click'), (e) => {
//   console.log('clicked')
//   selected.innerHTML = JSON.stringify(e)
// }

function bind(d) {
   populatePicker(d["nodes"], picker);
   populatePicker(
     graph.interactive_modes,
     modes,
     (e) => e.label,
     (e) => e.value
   );

  modes.addEventListener("change", (e) => {
    const value = e.target.value;
    mygraph.setMode(value);
    console.log("change mode: ", value);
  });

  mygraph.data(d);
  // mygraph.addItem('group', d.group)
  mygraph.render();
  mygraph.positionsAnimate();
}

// docs / debug
(function () {
  let _data = text.doc_graph(b, "information and the universe");
  // let s =  graph.getNodeByName(_data, "(say, in OR)")[0]
  // let i =     graph.getNodeByName(_data, "information and the universe")[0]
  // let e = graph.buildEdge(s,i)
  // e && _data.edges.push(e)

  function para(t, e = "p") {
    let p = document.createElement(e);
    p.innerHTML = t;
    document.body.appendChild(p);
  }

  function json(s) {
    return JSON.stringify(s, null, 4);
  }

  para("DATA", "h2");
  para(json(_data), "pre");

  let f = "";
  para("getNodeByName :func:", "h2");
  para("given a list of nodes:");
  para(json(data.nodes), "pre");
  para("return objects that satisfy the text predicate against label || id");
  para(
    'getNodeByName(data, "node1")\n' +
      json(graph.getNodeByName(_data, "node1")),
    "pre"
  );

  para("settings.fill_paragraph(t : STRING)", "h2");
  para("like the emacs one!!");

  let source = `I've been thinking about the same thing for papers, books, codebases, social
structures ([[file:20200419T200115Z-youtube.org][youtube]] / mastodon / lbry), that have some time-versioned network
for which each output of the collection and parsing process yields some
/immutable/ data made available for reference (by some applicable identity
function, property, or predicate) by an identifying property, and an optional
state of that network.`;
  para("source = " + source, "pre");

  para(
    "fill_paragraph(source): " +
      `
  
  ` +
      settings.fill_paragraph(source),
    "pre"
  );

  para("blocks_text(t : TEXT, r : REGEXP) :func:", "h2");
  para(`segmentation of BLOCKS, given a measure, in low-structured text`);
  para("- e.g of DISTANCE '/\\n\\s*\\n/'");
  para("- e.g of interesting elements (org-mode italics) /.*/");

  para(
    `b = \`Addressing /a graph of citations/ and the general idea of /content/ being
something that should exist separate to one's idea/note/analysis of it.

An idea of capturing existing structures and ne tworks and making them available
for reference (say, in OR).
  
I've been thinking about the same thing for papers, books, codebases, social
structures [...]\`\n
blocks_text(b, /\\n\\s*\\n)\n` +
      json(text.blocks_text(b, text.re_paragraph)),
    "pre"
  );

  para("So the same idea can be applied for the entire DOCUMENT `b':");
  para(json(b.match(text.re_interesting)), "pre");

  para(
    "...or, like in `text.doc_graph`, by paragraph (mapped over `re_paragraph' split)"
  );
  para(
    json(
      text.blocks_text(b, text.re_paragraph).map(function (e) {
        return {
          paragraph: e,
          interesting: text.interesting(e)
        };
      })
    ),
    "pre"
  );

  para("doc_graph(t : STRING, name : STRING) :func:", "h2");
  para(json(text.doc_graph(b, "information and the universe")), "pre");

  let bullets = `- what do I mean by notetaking (operationalise)
  - like feynman, a thought process
  - recording facts about the world, and their relationships
  - systems for remembering
    - flashcards (anki, org-drill, etc)
  - for me, also graphical things
    - system diagrams
    - topologies
    - ontologies, taxonomy
  - hard work is important, but that doesn't mean that every part of the
    experience should be hard in equal proportion
- what is the experience?
  - paper
    - accessible, but in most cases, lower order, no easy way to follow a protocol
    - not machine readable, which might be okay, depending on who you are, and
      that which you consider ephemeral garbage
    - the data is natural language, and arbitrary graphics
    - can be shared pretty easily
  - onenote
    - handdrawing, typing, cell structure
    - proprietary, garbage, locked up cloud
    - much the same as other platforms - I would consider these as equal; pages,
      evernote, notion
    - sharing is usually okay, and as no reference system exists, you're
      probably copying & pasting everything in, or have some nightmare ETL
      reconciliation script like the ruby guys from the zettelkasten forum
  - roam / etc
    + a graph! a real cognitive leap
    + associative navigation is nice (n-ary context > category)
    + but everything is still lower order
  - so what's next?
    + text analysis
    + higher order objects (types? direction? recursion? composition?)
    + completion mechanism based on what you're looking at
    + make easy things automated
      - topic modelling, textrank on incoming data
    + extensible external data connectors / protocol
    + sharing, collaboration
    + arbitrary embeddings (transclusion)`;
  para("parse_bullets(t : STRING) :func:", "h2");
  let bul = text.parse_bullets(bullets);
  para(json(bul), "pre");

  para("so a hierarchical structure can be parsed from this");

  para("label(t : STRING) :func:", "h2");
  para("short enough: " + settings.label("a small boy"));
  para("truncated: " + settings.label("\na larger boy at the limit"));

  // para("graph.buildNode :func:", "h2");
  // f = 'graph.buildNode("delimited by _distance_ to next paragraph,")\n';
  // para(f + json(eval(f)), "pre");

  // para("graph.buildEdge :func:", "h2");
  // f = 'graph.buildEdge({id: "yes"}, {id: "sir"})\n';
  // para(f + json(eval(f)), "pre");

  /// I LIKE TO BIND
  /// AND TO BE BOUND
  bind(_data);
})();
