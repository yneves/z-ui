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
    this.evaluator = factory.createEvaluator(options);
  },  
  
  evaluate: {
    
    // .evaluate(vars)
    o: function(vars) {      
      return this.evaluator.evaluate(vars);
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
