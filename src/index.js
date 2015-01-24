'use strict';
// - -------------------------------------------------------------------- - //
// - Libs

var factory = require('bauer-factory');
var Area = require('./area.js');
var Layout = require('./layout.js');
var Interaction = require('./interaction.js');
var Draggable = require('./interactions/draggable.js');

// - -------------------------------------------------------------------- - //
// - Init

window.onload = function() {

    var layout = new Layout(document.body);

    var a = new Area('a', {
        top: 20,
        left: 20,
        width: 100,
        height: 100,
    });

    var b = new Area('b', {
        top: a.createEvaluator('top + 10'),
        left: a.createEvaluator('left + 120'),
        width: 100,
        height: 100,
    });

    var c = new Area('c', {
        top: b.createEvaluator('top + 10'),
        left: b.createEvaluator('left + 120'),
        width: 100,
        height: 100,
    });

    var d = new Area('d', {
        bottom: 20,
        left: 20,
        width: 100,
        height: 100,
    });

    layout.addArea(a,b,c,d);

    layout.applyLayout();
    
    var draggable = new Draggable({
        restrict: 'target.top <= layout.top || target.left <= layout.left'
    });
    
    a.addInteraction(draggable);
  
};


// - -------------------------------------------------------------------- - //
