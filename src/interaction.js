'use strict';
// - -------------------------------------------------------------------- - //
// - Libs

var events = require('events');
var factory = require('bauer-factory');

// - -------------------------------------------------------------------- - //
// - Interaction

var Interaction = factory.class({
  
    inherits: events.EventEmitter,
  
    // new Interaction()
    constructor: function() {
        this.active = {};        
    },  
    
    createEvaluator: {
        
        // .createEvaluator(expr)
        s: function(expr) {
            this.evaluator = factory.createEvaluator(expr);
        },
        
        // .createEvaluator(parts)
        a: function(parts) {
            this.createEvaluator(parts.join(' && '));
        },
        
        // .createEvaluator(options)
        o: function(options) {
            this.evaluator = factory.createEvaluator(options);
        },
        
    },
  
    // .applyInteraction(context)
    applyInteraction: function(context) {        
        var active = this.active;
        var areaId;
        var activate;        
        if (this.evaluator) {
            areaId = context.area.id;
            activate = this.evaluator.evaluate({ 
                area: context.area.vars,            
                layout: context.layout.vars,
                pointer: context.pointer.vars, 
            });
            if (activate) {
                if (!active[areaId]) {
                    active[areaId] = context;
                    this.emit('activate',context);
                }
            } else {
                if (active[areaId]) {
                    this.emit('deactivate',active[areaId]);
                    delete active[areaId];
                }
            }
        }
    },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Interaction;

// - -------------------------------------------------------------------- - //
