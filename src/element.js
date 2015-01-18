// - -------------------------------------------------------------------- - //
// - Libs

var events = require("events");
var factory = require("bauer-factory");
var parser = require("./parser.js").Parser;
var Expression = parser.Expression;

// - -------------------------------------------------------------------- - //
// - Element

var Element = factory.class({
  
  inherits: events.EventEmitter,
  
  // new Element(vars)
  constructor: function(vars) {
    this.coords = {};
    this.interactions = [];
    this.setId(vars);
    this.setVars(vars);
    this.createNode();
  },

// - -------------------------------------------------------------------- - //
  
  setId: {
    
    // .setId(vars)
    o: function(vars) {
      if (factory.isString(vars.id)) {
        this.id = vars.id;
      } else {
        this.id = "e" + factory.guid();
      }
    },
    
    // .setId(id)
    s: function(id) {
      this.id = id;
    },
    
  },

  // .setVars(vars)
  setVars: function(vars) {
    this.vars = {};    
    this.keys = [];
    var keys = Object.keys(vars);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (key !== "id") {        
        this.keys.push(key);
        var val = vars[key];
        if (factory.isNumber(val)) {
          this.vars[key] = val;
        } else if (val instanceof Expression) {
          this.vars[key] = val;
        } else {
          this.vars[key] = parser.parse(val);
        }        
      }        
    }
  },
  
  // .createNode()
  createNode: function() {
    this.node = document.createElement("DIV");
    var style = this.node.style;
    style.position = "absolute";
    style.backgroundColor = ["red","yellow","green","black","blue","violet","brown","grey"][Math.floor(Math.random() * 8)];
  },

// - -------------------------------------------------------------------- - //
  
  // .mergeVars(vars)
  mergeVars: function(vars) {
    var id = this.id;
    var keys = Object.keys(this.vars);
    var length = keys.length;    
    for (var i = 0; i < length; i++) {
      var key = keys[i];      
      vars[id + "_" + key] = this.vars[key];      
    }
  },

  // .createExpr(text)
  createExpr: function(text) {    
    var expression = parser.parse(text);    
    var id = this.id;
    var keys = this.keys;
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      expression = expression.substitute(key,id + "_" + key);
    }
    return expression;
  },
  
  // .evalExpr(vars)
  evalExpr: function(vars) {
    
    var id = this.id;
    var keys = this.keys;
    var length = keys.length;
    
    var done = 0;    
    for (var i = 0; i < length; i++) {      
      var id_key = id + "_" + keys[i];      
      if (vars[id_key] instanceof Expression) {
        var value = vars[id_key].evaluate(vars);
        if (factory.isNumber(value)) {
          vars[id_key] = value;
          done++;
        }        
      } else if (factory.isNumber(vars[id_key])) {
        done++;
      }      
    }
    
    if (done) {      
      var coords = this.coords;
      var style = this.node.style;
      for (var i = 0; i < length; i++) {
        var key = keys[i];      
        var id_key = id + "_" + key;
        coords[key] = vars[id_key];
        var value = vars[id_key].toString() + "px";
        if (value !== style[key]) {
          style[key] = value;
        }          
      }
    }
    
    return done;
  },

// - -------------------------------------------------------------------- - //
  
  // .updateArea(event)
  updateArea: function(event) {
    var coords = this.coords;
    var hasTop = coords.hasOwnProperty("top");
    var hasBottom = coords.hasOwnProperty("bottom");
    var hasLeft = coords.hasOwnProperty("left");
    var hasRight = coords.hasOwnProperty("right");
    var hasWidth = coords.hasOwnProperty("width");
    var hasHeight = coords.hasOwnProperty("height");    
    this.top = hasTop ? coords.top : hasBottom ? event.layout.height - coords.bottom - coords.height : 0;
    this.left = hasLeft ? coords.left : hasRight ? event.layout.width - coords.right - coords.width : 0;
    this.right = hasRight ? event.layout.width - coords.right : hasLeft ? coords.left + coords.width : 0;
    this.bottom = hasBottom ? event.layout.height - coords.bottom : hasTop ? coords.top + coords.height : 0;
    this.width = hasWidth ? coords.width : right - left;
    this.height = hasHeight ? coords.height : bottom - top;
  },
  
  // .addInteraction(interaction)
  addInteraction: function(interaction) {    
    this.interactions.push(interaction);
  },
  
  // .triggerInteraction(event)
  triggerInteraction: function(event) {
    this.updateArea(event);
    event.element = this;
    var interactions = this.interactions;
    var length = interactions.length;
    for (var i = 0; i < length; i++) {
      interactions[i].triggerInteraction(event);
    }      
  },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Element;

// - -------------------------------------------------------------------- - //
