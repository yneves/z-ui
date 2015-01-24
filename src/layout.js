'use strict';
// - -------------------------------------------------------------------- - //
// - Libs

var events = require('events');
var factory = require('bauer-factory');
var Pointer = require('./pointer.js');

// - -------------------------------------------------------------------- - //
// - Layout

var Layout = factory.class({

    inherits: events.EventEmitter,

    // new Layout(node)
    constructor: function(node) {
        this.vars = {};
        this.areas = [];
        this.node = node;
        this.pointer = new Pointer(this.node);
        this.pointer.on('move',this._onPointerMove.bind(this));
        window.onresize = this._onWindowResize.bind(this);
        this.updateVars();
    },

    _onPointerMove: function() {
        this.applyInteraction();
    },

    _onWindowResize: function() {
        this.updateVars();
    },

// - -------------------------------------------------------------------- - //

    // .addArea(area, ...)
    addArea: function() {
        
        var node = this.node;
        var areas = this.areas;
        var length = arguments.length;
        var i;
        var area;
        
        for (i = 0; i < length; i++) {
            area = arguments[i];
            areas[area.id] = area;
            node.appendChild(area.node);
            area.setLayout(this);
        }
        
    },

// - -------------------------------------------------------------------- - //

    // .updateVars()
    updateVars: function() {
        var vars = this.vars;
        var node = this.node;
        vars.width = Number(node.offsetWidth);
        vars.height = Number(node.offsetHeight);
        vars.top = Number(node.offsetTop);
        vars.left = Number(node.offsetLeft);
        vars.right = vars.left + vars.width;
        vars.bottom = vars.top + vars.height;
    },

// - -------------------------------------------------------------------- - //

    // .applyLayout()
    applyLayout: function() {

        var coords = {};
        var doneCount = 0;
        var doneAreas = {};
        var areas = this.areas;
        var ids = Object.keys(areas);
        var length = ids.length;
        var c;
        var i;
        var id;

        for (i = 0; i < length; i++) {
            id = ids[i];
            coords[id] = areas[id].getCoords();
        }

        for (c = 0; c < 10; c++) {
            for (i = 0; i < length; i++) {
                if (!doneAreas[i]) {
                    if (areas[ids[i]].applyLayout(coords)) {
                        doneCount++;
                        doneAreas[i] = true;
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
        
        var areas = this.areas;
        var ids = Object.keys(areas);
        var length = ids.length;
        var i;
        var id;
        var area;

        for (i = 0; i < length; i++) {
            id = ids[i];
            area = areas[id];
            area.applyInteraction({
                area: area,
                layout: this,
                pointer: this.pointer,
            });
        }
        
    },

});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Layout;

// - -------------------------------------------------------------------- - //
