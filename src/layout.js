// - -------------------------------------------------------------------- - //
// - Libs

var events = require("events");
var factory = require("bauer-factory");
var Pointer = require("./pointer.js");

// - -------------------------------------------------------------------- - //
// - Layout

var Layout = factory.class({

  inherits: events.EventEmitter,
  
  // new Layout(root)
  constructor: function(root) {
    this.root = root;
    this.elements = [];
    this.init();
  },
  
  // .init()
  init: function() {
    
    this.pointer = new Pointer(this.root);
    
    this.pointer.on("click",function(event) {
      console.log("click",event);
    });
    
    this.pointer.on("rightclick",function(event) {
      console.log("rightclick",event);
    });
    
    this.pointer.on("dragstart",function(event) {
      console.log("dragstart",event);
    });
    
    this.pointer.on("dragstop",function(event) {
      console.log("dragstop",event);
    });
    
    this.pointer.on("dragmove",function(event) {
      console.log("dragmove",event);
    });
    
  },
  
  // .add(element, ...)
  add: function() {
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
      var element = arguments[i];
      this.elements[element.id] = element;
      this.root.appendChild(element.node);      
    }    
  },
  
  // .place()
  place: function() {
    var ids = Object.keys(this.elements);
    var length = ids.length;
    var ok = 0;
    var attr = {};
    CYCLES: for (var c = 0; c < 10; c++) {      
      ELEMENTS: for (var i = 0; i < length; i++) {
        var id = ids[i];
        var element = this.elements[id];
        if (element.place(attr)) {
          ok++
        }
      }
      if (ok === length) {
        break CYCLES;
      }
    }    
  },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Layout;

// - -------------------------------------------------------------------- - //
