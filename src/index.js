// - -------------------------------------------------------------------- - //
// - Libs

var factory = require("bauer-factory");
var Layout = require("./layout.js");
var Element = require("./element.js");
var Interaction = require("./interaction.js");

// - -------------------------------------------------------------------- - //
// - Init

window.onload = function() {

  var layout = new Layout(document.body);

  var a = new Element({
    id: "a",
    top: 20,
    left: 20,
    width: 100,
    height: 100,
  });
  
  var b = new Element({
    id: "b",
    top: 20,
    left: a.createExpr("left + 120"),
    width: 100,
    height: 100,
  });
  
  var c = new Element({
    id: "c",
    top: 20,
    left: b.createExpr("left + 120"),
    width: 100,
    height: 100,
  });
  
  var d = new Element({
    id: "d",
    bottom: 20,
    left: 20,
    width: 100,
    height: 100,
  });
  
  layout.addElement(a,b,c,d);
  
  layout.apply();
  
  var interaction = new Interaction({
    expr: "element.top <= (pointer.top + distance) && element.top >= (pointer.top - distance)",
    vars: { distance: 5 },
  });
  
  a.addInteraction(interaction);
  b.addInteraction(interaction);
  c.addInteraction(interaction);
  d.addInteraction(interaction);
  
  interaction.on("activate",function(event) {
    event.element.node.style.cursor = "n-resize";
  });
  
  interaction.on("deactivate",function() {
    event.element.node.style.cursor = "";
  });
  
    // var distance = 5;
    // var style = this.node.style;
    // if (top <= (pointer.top + distance) && top >= (pointer.top - distance)) {
    //   style.cursor = "n-resize";
    // } else if (bottom <= (pointer.top + distance) && bottom >= (pointer.top - distance)) {
    //   style.cursor = "s-resize";
    // } else if (left <= (pointer.left + distance) && left >= (pointer.left - distance)) {
    //   style.cursor = "w-resize";
    // } else if (right <= (pointer.left + distance) && right >= (pointer.left - distance)) {
    //   style.cursor = "e-resize";
    // } else if (style.cursor !== "") {
    //   style.cursor = "";
    // }
  
};


// - -------------------------------------------------------------------- - //
