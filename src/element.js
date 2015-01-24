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
  
  constructor: {
    
    // new Element(id)
    s: function(id) {
      this.init();
      this.setId(id);
    },

    // new Element(coords)
    o: function(coords) {
      this.init();
      this.setId("e" + factory.guid());
      this.setCoords(coords);
    },
    
    // new Element(id,coords)
    so: function(id,coords) {
      this.init();
      this.setId(id,coords);
      this.setCoords(coords);
    },
    
  },

// - -------------------------------------------------------------------- - //

  // .init();
  init: function() {
    this.vars = {};    
    this.interactions = [];
    this.node = document.createElement("DIV");
    this.node.style.position = "absolute";
    this.node.style.backgroundColor = ["red","yellow","green","black","blue","violet","brown","grey"][Math.floor(Math.random() * 8)];
  },
  
  setId: {
    
    // .setId(id)
    s: function(id) {
      this.id = id;
    },
    
  },

  setCoords: {
    
    // .setCoords(coords)
    o: function(coords) {
      this.keys = [];
      this.coords = {};
      var keys = Object.keys(vars);
      var length = keys.length;
      for (var i = 0; i < length; i++) {
        var key = keys[i];
        this.keys.push(key);
        var val = coords[key];
        if (factory.isNumber(val)) {
          this.coords[key] = val;
        } else if (factory.isEvaluator(val)) {
          this.coords[key] = val;
        } else {
          this.coords[key] = factory.createEvaluator(val);
        }        
      }
    },
    
  },
  
// - -------------------------------------------------------------------- - //
  
  // .applyLayout(coords)
  applyLayout: function(coords) {    
    var id = this.id;
    var keys = this.keys;
    var length = keys.length;    
    var done = 0;
    for (var i = 0; i < length; i++) {      
      if (factory.isEvaluator(coords[id][key])) {
        var value = coords[id][key].evaluate(vars);
        if (factory.isNumber(value)) {
          coords[id][key] = value;
          done++;
        }        
      } else if (factory.isNumber(coords[id][key])) {
        done++;
      }      
    }    
    if (done) {      
      var values = this.values;
      var style = this.node.style;
      for (var i = 0; i < length; i++) {
        var key = keys[i];              
        var value = coords[id][key];
        if (value !== values[key]) {
          values[key] = value;
          style[key] = value.toString() + "px";          
        }
      }
    }    
    return done;
  },

// - -------------------------------------------------------------------- - //
  
  // .addInteraction(interaction)
  addInteraction: function(interaction) {    
    this.interactions.push(interaction);
  },
  
  // .triggerInteraction(context)
  applyInteraction: function(context) {
    this.updateVars(context);
    context.element = this;
    var interactions = this.interactions;
    var length = interactions.length;
    for (var i = 0; i < length; i++) {
      interactions[i].apply(event);
    }      
  },

  // .updateVars(context)
  updateVars: function(context) {
    var values = this.values;
    var hasTop = values.hasOwnProperty("top");
    var hasBottom = values.hasOwnProperty("bottom");
    var hasLeft = values.hasOwnProperty("left");
    var hasRight = values.hasOwnProperty("right");
    var hasWidth = values.hasOwnProperty("width");
    var hasHeight = values.hasOwnProperty("height");
    var vars = this.vars;
    vars.top = hasTop ? values.top : hasBottom ? context.layout.height - values.bottom - values.height : 0;
    vars.left = hasLeft ? values.left : hasRight ? context.layout.width - values.right - values.width : 0;
    vars.right = hasRight ? context.layout.width - values.right : hasLeft ? values.left + values.width : 0;
    vars.bottom = hasBottom ? context.layout.height - values.bottom : hasTop ? values.top + values.height : 0;
    vars.width = hasWidth ? values.width : right - left;
    vars.height = hasHeight ? values.height : bottom - top;
  },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Element;

// - -------------------------------------------------------------------- - //
