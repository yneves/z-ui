// - -------------------------------------------------------------------- - //
// - Libs

var events = require("events");
var factory = require("bauer-factory");
var Pointer = require("./pointer.js");

// - -------------------------------------------------------------------- - //
// - Layout

var Layout = factory.class({

  inherits: events.EventEmitter,
  
  // new Layout(node)
  constructor: function(node) {
    
    this.vars = {};
    this.elements = [];
    
    this.node = node;
    
    this.pointer = new Pointer(this.node);
    this.pointer.on("move",this._onPointerMove.bind(this));    
    
    this._onWindowResize();
    
  },

// - -------------------------------------------------------------------- - //

  _onPointerMove: function(event) {    
    this.applyInteraction();
  },

  _onWindowResize: function() {
    this.vars.width = parseInt(this.node.offsetWidth);
    this.vars.height = parseInt(this.node.offsetHeight);
  },

// - -------------------------------------------------------------------- - //
    
  // .addElement(element, ...)
  addElement: function() {
    var node = this.node;
    var elements = this.elements;
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
      var element = arguments[i];
      elements[element.id] = element;
      node.appendChild(element.node);
    }    
  },

// - -------------------------------------------------------------------- - //
  
  // .applyLayout()
  applyLayout: function() {
    var coords = {};
    var elements = this.elements;
    var ids = Object.keys(elements);
    var length = ids.length;    
    for (var i = 0; i < length; i++) {
      var id = ids[i];
      coords[id] = factory.clone(elements[id].coords);
    }
    var doneCount = 0;
    var doneElements = {};    
    for (var c = 0; c < 10; c++) {
      for (var e = 0; e < length; e++) {
        if (!doneElements[e]) {
          if (elements[ids[e]].applyLayout(coords)) {
            doneCount++;
            doneElements[e] = true;
          }
        }
      }      
      if (doneCount === length) {
        break;
      }
    }
  },
  
  // .applyInteraction()
  applyInteraction: function() {
    var elements = this.elements;
    var ids = Object.keys(elements);
    var length = ids.length;
    for (var i = 0; i < length; i++) {
      var element = elements[ids[i]];
      var context = {};
      context.event = event;
      context.layout = this;
      context.pointer = this.pointer;
      context.element = element;
      element.applyInteraction(context);
    }
  },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Layout;

// - -------------------------------------------------------------------- - //
