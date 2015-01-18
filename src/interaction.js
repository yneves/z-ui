// - -------------------------------------------------------------------- - //
// - Libs

var events = require("events");
var factory = require("bauer-factory");

// - -------------------------------------------------------------------- - //
// - Interaction

var Interaction = factory.class({
  
  inherits: events.EventEmitter,
  
  // new Interaction(options)
  constructor: function(options) {
    this.active = {};
    this.setExpr(options);
  },  
  
  setVars: {
  
    // .setVars(vars)
    o: function(vars) {
      this.vars = vars;
    },
    
  },
  
  setExpr: {
    
    // .setExpr(options)
    o: function(options) {
      this.setExpr(options.expr);
      this.setVars(options.vars);
    },
    
    // .setExpr(expr)
    s: function(expr) {
      this.expr = expr;
    },
      
  },
  
  
  evalExpr: {
    
    // .evalExpr(vars)
    o: function(vars) {
      var activate = false;
      var code = [];    
      var names = Object.keys(vars);
      var length = names.length;
      for (var i = 0; i < length; i++) {
        code.push("var " + names[i] + " = vars['" + names[i] + "'];\n");
      }    
      var names = Object.keys(this.vars);
      var length = names.length;
      for (var i = 0; i < length; i++) {
        code.push("var " + names[i] + " = this.vars['" + names[i] + "'];\n");
      }
      code.push("activate = (" + this.expr + ");\n");
      eval(code.join(""));
      return activate;
    },
      
  },
  
  // .triggerInteraction(event)
  triggerInteraction: function(event) {
    var activate = this.evalExpr({ 
      element: event.element,
      pointer: event.pointer, 
      layout: event.layout,
    });
    if (activate) {
      if (!this.active[event.element.id]) {
        this.active[event.element.id] = true;
        this.emit("activate",event);
      }
    } else {
      if (this.active[event.element.id]) {
        this.active[event.element.id] = false;
        this.emit("deactivate",event);
      }
    }
  },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Interaction;

// - -------------------------------------------------------------------- - //
