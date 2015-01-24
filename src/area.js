'use strict';
// - -------------------------------------------------------------------- - //
// - Libs

var events = require('events');
var factory = require('bauer-factory');

// - -------------------------------------------------------------------- - //
// - Area

var Area = factory.class({

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
        this.setId('e' + factory.guid());
        this.setCoords(coords);
    },

    // new Element(id,coords)
    so: function(id,coords) {
        this.init();
        this.setId(id);
        this.setCoords(coords);
    },

  },

// - -------------------------------------------------------------------- - //

    // .init();
    init: function() {
        this.keys = [];
        this.vars = {};
        this.values = {};
        this.coords = {};        
        this.interactions = [];
        this.node = document.createElement('DIV');
        this.node.style.position = 'absolute';
        this.node.style.backgroundColor = ['red','yellow','green','black','blue','violet','brown','grey'][Math.floor(Math.random() * 8)];
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

            var keys = Object.keys(coords);
            var length = keys.length;
            var i;
            var key;
            var value;

            for (i = 0; i < length; i++) {
                key = keys[i];
                value = coords[key];
                if (factory.isNumber(value)) {
                    this.coords[key] = value;
                } else if (factory.isEvaluator(value)) {
                    this.coords[key] = value;
                } else {
                    this.coords[key] = factory.createEvaluator(value);
                }
            }
            
            this.keys = Object.keys(this.coords);
        },

    },
    
    // .getCoords()
    getCoords: function() {
        var coords = {};
        var keys = this.keys;
        var length = keys.length;
        var i;
        var key;

        for (i = 0; i < length; i++) {
            key = keys[i];
            coords[key] = this.coords[key];
        }
        
        return coords;
    },

// - -------------------------------------------------------------------- - //

    // .setLayout(layout)
    setLayout: function(layout) {
        this.layout = layout;
    },
    
    // .getLayout()
    getLayout: function() {
        return this.layout;
    },

    // .applyLayout(coords)
    applyLayout: function(coords) {

        var id = this.id;
        var keys = this.keys;
        var values = this.values;
        var style = this.node.style;
        var length = keys.length;
        var done = 0;
        var i;
        var result;
        var key;
        var value;

        for (i = 0; i < length; i++) {
            key = keys[i];            
            if (factory.isEvaluator(coords[id][key])) {
                result = coords[id][key].evaluate(coords);
                if (factory.isNumber(result)) {
                    coords[id][key] = result;
                    done++;
                }
            } else if (factory.isNumber(coords[id][key])) {
                done++;
            }
        }

        if (done) {            
            for (i = 0; i < length; i++) {
                key = keys[i];
                value = coords[id][key];
                if (value !== values[key]) {
                    values[key] = value;
                    style[key] = value.toString() + 'px';
                }
            }            
            this.updateVars();
        }

        return done;
    },

// - -------------------------------------------------------------------- - //

    // .addInteraction(interaction)
    addInteraction: function(interaction) {
        this.interactions.push(interaction);
    },

    // .applyInteraction(context)
    applyInteraction: function(context) {

        var interactions = this.interactions;
        var length = interactions.length;
        var i;
        
        for (i = 0; i < length; i++) {
            interactions[i].applyInteraction(context);
        }

    },

// - -------------------------------------------------------------------- - //

    // .updateVars()
    updateVars: function() {
        var vars = this.vars;
        var values = this.values;
        var layout = this.layout;
        var hasTop = values.hasOwnProperty('top');
        var hasBottom = values.hasOwnProperty('bottom');
        var hasLeft = values.hasOwnProperty('left');
        var hasRight = values.hasOwnProperty('right');
        var hasWidth = values.hasOwnProperty('width');
        var hasHeight = values.hasOwnProperty('height');
        vars.top = hasTop ? values.top : hasBottom ? layout.height - values.bottom - values.height : 0;
        vars.left = hasLeft ? values.left : hasRight ? layout.width - values.right - values.width : 0;
        vars.right = hasRight ? layout.width - values.right : hasLeft ? values.left + values.width : 0;
        vars.bottom = hasBottom ? layout.height - values.bottom : hasTop ? values.top + values.height : 0;
        vars.width = hasWidth ? values.width : vars.right - vars.left;
        vars.height = hasHeight ? values.height : vars.bottom - vars.top;
    },

    createEvaluator: {

        // .createEvaluator(expr)
        s: function(expr) {
            var names = ['top', 'bottom', 'left', 'right', 'width', 'height'];
            var length = names.length;
            var id = this.id;
            var i;
            var name;
            var regexp;
            for (i = 0; i < length; i++) {
                name = names[i];
                regexp = new RegExp('[^\\.]*' + name,'g');
                expr = expr.replace(regexp, id + '.' + name);
            }
            return factory.createEvaluator(expr);
        },

    },

});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Area;

// - -------------------------------------------------------------------- - //
