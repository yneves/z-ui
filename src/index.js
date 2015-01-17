// - -------------------------------------------------------------------- - //
// - Libs

var factory = require("bauer-factory");
var Layout = require("./layout.js");
var Element = require("./element.js");

// - -------------------------------------------------------------------- - //
// - Init

window.onload = function() {

  var layout = new Layout(document.body);

  var a = new Element({
    top: 20,
    left: 20,
    width: 100,
    height: 100,
  });
  
  var b = new Element({
    top: 20,
    left: a.id + "_left + 120",
    width: 100,
    height: 100,
  });
  
  var c = new Element({
    top: 20,
    left: b.id + "_left + 120",
    width: 100,
    height: 100,
  });
  
  var d = new Element({
    bottom: 20,
    left: 20,
    width: 100,
    height: 100,
  });
  
  layout.add(a,b,c,d);
  
  layout.place();
  
};


// - -------------------------------------------------------------------- - //
