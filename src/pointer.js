'use strict';
// - -------------------------------------------------------------------- - //
// - Libs

var events = require('events');
var factory = require('bauer-factory');

// - -------------------------------------------------------------------- - //
// - Pointer

var Pointer = factory.class({
  
  inherits: events.EventEmitter,
  
    // new Pointer(node)
    constructor: function(node) {
        this.vars = {};
        this.node = node;
        this.initEventListeners();
    },
  
    // .initEventListeners()
    initEventListeners: function() {
    
        var pointer = this;
        var node = this.node;
        var documentElement = document.documentElement;
        var hasEventsCoords = !!document.addEventListener;
        var mouseUp = 'mouseup';
        var mouseDown = 'mousedown';
        var mouseMove = 'mousemove';
        var contextMenu = 'contextmenu';
        var leftKeyCode = 1;
        var leftButtonCode = 1;
        var rightKeyCode = 3;
        var rightButtonCode = 2;
        var dragDistance = 3;
        var isDragging = false;
        var isLeftButton = false;
        var isRightButton = false;
        var startX;
        var startY;
        var currentX;
        var currentY;
        var addListener;
        var removeListener;
        var handleMenu;
        var handleDown;
        var handleUp;
        var handleMove;

        if (window.navigator.msPointerEnabled) {
            this.node.style.touchAction = 'none';
        }

        addListener = function(element,event,handler) {
            if (element.addEventListener) {
                element.addEventListener(event,handler,false);
            } else if (node.attachEvent) {
                element.attachEvent('on' + event,handler);
            }
        };

        removeListener = function(element,event,handler) {
            if (element.removeEventListener) {
                element.removeEventListener(event,handler,false);
            } else if (node.detachEvent) {
                element.detachEvent('on' + event,handler);
            }
        };

        handleMenu = function(event) {
            event.returnValue = false;
            if (typeof event.preventDefault === 'function') {
                event.preventDefault();
            }
            event.cancelBubble = true;
            if (typeof event.stopPropagation === 'function') {
                event.stopPropagation();
            }
        };

        handleMove  = function(event) {
            event.returnValue = false;
            if (typeof event.preventDefault === 'function') {
                event.preventDefault();
            }
            event.cancelBubble = true;
            if (typeof event.stopPropagation === 'function') {
                event.stopPropagation();
            }
            if (hasEventsCoords) {
                currentX = event.pageX;
                currentY = event.pageY;
            } else {
                currentX = event.clientX + documentElement.scrollLeft;
                currentY = event.clientY + documentElement.scrollTop;
            }
            pointer.vars.top = currentY;
            pointer.vars.left = currentX;
            event.pointer = pointer;
            event.isLeftClick = isLeftButton;
            event.isRightClick = isRightButton;
            pointer.emit('move',event);
            if (isDragging) {				
                pointer.emit('dragmove',event);
            } else if (isLeftButton || isRightButton) {
                isDragging = (Math.abs(currentX - startX) > dragDistance) || (Math.abs(currentY - startY) > dragDistance);
                if (isDragging) {					
                    pointer.emit('dragstart',event);
                }
            }
        };

        handleUp = function(event) {
            event.returnValue = false;
            if (typeof event.preventDefault === 'function') {
                event.preventDefault();
            }
            if (hasEventsCoords) {
                currentX = event.pageX;
                currentY = event.pageY;
            } else {
                currentX = event.clientX + documentElement.scrollLeft;
                currentY = event.clientY + documentElement.scrollTop;
            }
            pointer.vars.top = currentY;
            pointer.vars.left = currentX;
            event.pointer = pointer;      
            event.isLeftClick = isLeftButton;
            event.isRightClick = isRightButton;
            pointer.emit('up',event);
            if (isDragging) {				
                pointer.emit('dragstop',event);
            } else if (isLeftButton) {				
                pointer.emit('click',event);
            } else if (isRightButton) {				
                pointer.emit('rightclick',event);
            }
            startX = undefined;
            startY = undefined;
            isDragging = false;
            isLeftButton = false;
            isRightButton = false;			
        };

        handleDown = function(event) {
            event.returnValue = false;
            if (typeof event.preventDefault === 'function') {
                event.preventDefault();
            }
            if (event.which) {
                isLeftButton = event.which === leftKeyCode;
                isRightButton = event.which === rightKeyCode;
            } else if (event.button) {
                isLeftButton = event.button === leftButtonCode;
                isRightButton = event.button === rightButtonCode;
            }
            if (isLeftButton || isRightButton) {
                if (hasEventsCoords) {
                    startX = event.pageX;
                    startY = event.pageY;
                } else {
                    startX = event.clientX + documentElement.scrollLeft;
                    startY = event.clientY + documentElement.scrollTop;
                }				
            }
            pointer.vars.top = startY;
            pointer.vars.left = startX;
            event.pointer = pointer;      
            event.isLeftClick = isLeftButton;
            event.isRightClick = isRightButton;
            pointer.emit('down',event);
        };

        addListener(this.node,mouseDown,handleDown);
        addListener(this.node,mouseMove,handleMove);
        addListener(this.node,mouseUp,handleUp);
        addListener(this.node,contextMenu,handleMenu);
    },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Pointer;

// - -------------------------------------------------------------------- - //
