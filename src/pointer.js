// - -------------------------------------------------------------------- - //
// - Libs

var events = require("events");
var factory = require("bauer-factory");


// - -------------------------------------------------------------------- - //
// - Pointer

var Pointer = factory.class({
  
  inherits: events.EventEmitter,
  
  // new Pointer(node)
  constructor: function(node) {
    this.node = node;
    this.init();
  },
  
  // .init()
  init: function() {
    
    var emitter = this;
    
    var hasPointer = window.navigator.msPointerEnabled;
		if (hasPointer) {
			this.node.style["touchAction"] = "none";
		}
    
    var documentElement = document.documentElement;
		var hasEventsCoords = !!document.addEventListener;
    
    var mouseUp = "mouseup";
		var mouseDown = "mousedown";
		var mouseMove = "mousemove";
		var contextMenu = "contextmenu";
		var leftKeyCode = 1;
		var leftButtonCode = 1;
		var rightKeyCode = 3;
		var rightButtonCode = 2;
		var dragDistance = 3;

		var startX;
		var startY;
		var isClick = false;
		var isDragging = false;
		var isLeftButton = false;
		var isRightButton = false;
    
    var addListener = function(element,event,handler) {
			if (element.addEventListener) {
				element.addEventListener(event,handler,false);
			} else if (node.attachEvent) {
				element.attachEvent("on" + event,handler);
			}
		};
    
    var removeListener = function(element,event,handler) {
			if (element.removeEventListener) {
				element.removeEventListener(event,handler,false);
			} else if (node.detachEvent) {
				element.detachEvent("on" + event,handler);
			}
    };
    
    var handleMenu = function(event) {
			event.returnValue = false;
			if (typeof event.preventDefault === "function") {
				event.preventDefault();
			}
			event.cancelBubble = true;
			if (typeof event.stopPropagation === "function") {
				event.stopPropagation();
			}
		};

		var handleMove  = function(event) {
			event.returnValue = false;
			if (typeof event.preventDefault === "function") {
				event.preventDefault();
			}
			event.cancelBubble = true;
			if (typeof event.stopPropagation === "function") {
				event.stopPropagation();
			}
			var currentX;
			var currentY;
			if (hasEventsCoords) {
				currentX = event.pageX;
				currentY = event.pageY;
			} else {
				currentX = event.clientX + documentElement.scrollLeft;
				currentY = event.clientY + documentElement.scrollTop;
			}
			if (isDragging) {
				event.pointer = { left: currentX, top: currentY };
        event.isLeftClick = isLeftButton;
        event.isRightClick = isRightButton;
				emitter.emit("dragmove",event);
			} else if (isLeftButton || isRightButton) {
				isDragging = (Math.abs(currentX - startX) > dragDistance) || (Math.abs(currentY - startY) > dragDistance);
				if (isDragging) {
					event.pointer = { left: currentX, top: currentY };
					event.isLeftClick = isLeftButton;
          event.isRightClick = isRightButton;
					emitter.emit("dragstart",event);
				}
			}
		};

		var handleUp = function(event) {
			event.returnValue = false;
			if (typeof event.preventDefault === "function") {
				event.preventDefault();
			}
			var currentX;
			var currentY;
			if (hasEventsCoords) {
				currentX = event.pageX;
				currentY = event.pageY;
			} else {
				currentX = event.clientX + documentElement.scrollLeft;
				currentY = event.clientY + documentElement.scrollTop;
			}
			if (isDragging) {
				event.pointer = { left: currentX, top: currentY };
        event.isLeftClick = isLeftButton;
        event.isRightClick = isRightButton;
				emitter.emit("dragstop",event);
			} else if (isLeftButton) {
				event.pointer = { left: currentX, top: currentY };
        event.isLeftClick = isLeftButton;
        event.isRightClick = isRightButton;
				emitter.emit("click",event);
			} else if (isRightButton) {
				event.pointer = { left: currentX, top: currentY };
        event.isLeftClick = isLeftButton;
        event.isRightClick = isRightButton;
				emitter.emit("rightclick",event);
			}
			startX = undefined;
			startY = undefined;
			isDragging = false;
			isLeftButton = false;
			isRightButton = false;
			removeListener(documentElement,mouseMove,handleMove);
			removeListener(documentElement,mouseUp,handleUp);
		};

		var handleDown = function(event) {
			event.returnValue = false;
			if (typeof event.preventDefault === "function") {
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
				addListener(documentElement,mouseMove,handleMove);
				addListener(documentElement,mouseUp,handleUp);
			}
		};

		addListener(this.node,mouseDown,handleDown);
		addListener(this.node,contextMenu,handleMenu);
    
  },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Pointer;

// - -------------------------------------------------------------------- - //
