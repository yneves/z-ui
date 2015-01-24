'use strict';
// - -------------------------------------------------------------------- - //
// - Libs

var factory = require('bauer-factory');
var Interaction = require('../interaction.js');

// - -------------------------------------------------------------------- - //
// - Draggable

var Draggable = factory.class({

    inherits: Interaction,

    // new Draggable(options)
    constructor: function(options) {
        
        if (factory.isObject(options)) {
            if (factory.isDefined(options.restrict)) {
                this.restrictEvaluator = factory.createEvaluator(options.restrict);
            }
        }

        this.createEvaluator([
            'pointer.left >= area.left',
            'pointer.left <= area.right',
            'pointer.top >= area.top',
            'pointer.top <= area.bottom'
        ]);

        this.on('activate',this._onActivate.bind(this));
        this.on('deactivate',this._onDeactivate.bind(this));

    },

    _onActivate: function(context) {
        var _this = this;
        var target = {};
        var relative = {};
        var restrict;
        context._onDragStart = function() {
            relative.top = context.pointer.vars.top - context.area.vars.top;
            relative.left = context.pointer.vars.left - context.area.vars.left;
        };
        context._onDragMove = function() {
            target.top = context.pointer.vars.top - relative.top;
            target.left = context.pointer.vars.left - relative.left;
            target.right = (context.pointer.vars.left - relative.left) + context.area.vars.width;
            target.bottom = (context.pointer.vars.top - relative.top) + context.area.vars.height;
            target.width = context.area.vars.width;
            target.height = context.area.vars.height;
            
            if (_this.restrictEvaluator) {
                
                restrict = _this.restrictEvaluator.evaluate({
                    target: target,
                    area: context.area.vars,
                    layout: context.layout.vars,
                    pointer: context.pointer.vars,                    
                });
                
                if (restrict) {
                    
                } else {
                    context.area.setCoords({
                        top: target.top,
                        left: target.left,
                    });
                }
            } else {
                context.area.setCoords({
                    top: target.top,
                    left: target.left,
                });
            }            
            context.layout.applyLayout();
            context.layout.applyInteraction();
        };
        context._onDragStop = function() {
            context.layout.applyLayout();
            context.layout.applyInteraction();
        };
        context.pointer.on('dragstart',context._onDragStart);
        context.pointer.on('dragmove',context._onDragMove);
        context.pointer.on('dragstop',context._onDragStop);
    },
    
    _onDeactivate: function(context) {
        context.pointer.removeListener('dragstart',context._onDragStart);
        context.pointer.removeListener('dragmove',context._onDragMove);
        context.pointer.removeListener('dragstop',context._onDragStop);
    },

});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Draggable;

// - -------------------------------------------------------------------- - //
