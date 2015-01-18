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
    this.width = parseInt(this.root.offsetWidth);
    this.height = parseInt(this.root.offsetHeight);
    this.elements = [];
    this.pointer = new Pointer(this.root);
    this.addListener();
  },

// - -------------------------------------------------------------------- - //
    
  // .addElement(element, ...)
  addElement: function() {
    var root = this.root;
    var elements = this.elements;
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
      var element = arguments[i];
      elements[element.id] = element;
      root.appendChild(element.node);      
    }    
  },
  
  // .addListener()
  addListener: function() {
    this.pointer.on("move",function(event) {
      event.layout = this;
      var elements = this.elements;
      var ids = Object.keys(elements);
      var length = ids.length;
      for (var i = 0; i < length; i++) {
        elements[ids[i]].triggerInteraction(event);
      }
    }.bind(this));    
  },

// - -------------------------------------------------------------------- - //
  
  // .apply()
  apply: function() {
    
    var elements = this.elements;
    var ids = Object.keys(elements);
    var length = ids.length;
    
    var vars = {};
    for (var i = 0; i < length; i++) {
      elements[ids[i]].mergeVars(vars);
    }
    
    var doneCount = 0;
    var doneElements = {};    
    for (var c = 0; c < 10; c++) {
      for (var i = 0; i < length; i++) {
        if (!doneElements[i]) {
          if (elements[ids[i]].evalExpr(vars)) {
            doneCount++;
            doneElements[i] = true;
          }
        }
      }      
      if (doneCount === length) {
        break;
      }      
    }
    
  },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Layout;

// - -------------------------------------------------------------------- - //
