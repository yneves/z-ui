// - -------------------------------------------------------------------- - //
// - Libs

var events = require("events");
var factory = require("bauer-factory");
var parser = require("./parser.js").Parser;

// - -------------------------------------------------------------------- - //
// - Element

var Element = factory.class({
  
  inherits: events.EventEmitter,
  
  // new Element(options)
  constructor: function(options) {
    this.options = factory.clone(options);
    if (factory.isString(this.options.id)) {
      this.id = this.options.id;
      delete this.options.id;
    } else {
      this.id = "e" + factory.guid();
    }    
    this.init();
  },
  
  // .init()
  init: function() {
    this.node = document.createElement("DIV");
    var style = this.node.style;
    style.position = "absolute";    
    style.backgroundColor = ["red","yellow","green","black","blue","violet","brown","grey"][Math.floor(Math.random() * 8)];
  },
  
  // .place(attr)
  place: function(attr) {
    
    var id = this.id;
    var opts = this.options;
    var keys = Object.keys(opts);
    var length = keys.length;
    
    for (var i = 0; i < length; i++) {
      var key = keys[i];      
      var id_key = id + "_" + key;
      if (factory.isUndefined(attr[id_key])) {
        attr[id_key] = opts[key];
      }
    }
        
    var ok = 0;
    for (var i = 0; i < length; i++) {
      var key = keys[i];      
      var id_key = id + "_" + key;
      if (factory.isString(attr[id_key])) {
        attr[id_key] = parser.evaluate(attr[id_key],attr);
      }
      if (factory.isNumber(attr[id_key])) {
        ok++;
      }
    }
    
    if (ok) {
      var style = this.node.style;
      for (var i = 0; i < length; i++) {
        var key = keys[i];      
        var id_key = id + "_" + key;
        style[key] = attr[id_key].toString() + "px";
      }
    }
    
    return ok;
  },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Element;

// - -------------------------------------------------------------------- - //
