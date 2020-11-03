// SETTINGS
const label_length = 20;
const label_truncate = "[...]";
const should_truncate_labels = true;
const line_length = 80;
const node_type = {
  demarcation: "d", // arbitrary grouping
  speculative: "s" // speculative; suggestion (from textlib.interesting)
};

function label(text) {
//  console.log(text);
  if (should_truncate_labels && text.length > label_length)
    return (
      text.substring(0, label_length + 1 - label_truncate.length) +
      label_truncate
    );

  return text;
}

// TODO fill-paragraph :func:
function fill_paragraph(t) {
  let p = t.replace(/\n/g, " ");
  let r = p.length / line_length;
  if (1 > r) return t;

  let coll = "";
  let last = 0;
  for (var i = line_length; i < p.length + line_length; i += line_length) {
    let ss = p.substring(last, i) + "\n";
    last = i;
    coll += ss;
  }

  return coll;
}

module.exports = {
  label_length,
  label_truncate,
  label,
  line_length,
  node_type,
  fill_paragraph
};
