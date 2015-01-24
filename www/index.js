(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var modules = [
	require("./lib/type.js"),
	require("./lib/method.js"),
	require("./lib/inherits.js"),
	require("./lib/property.js"),
	require("./lib/class.js"),
	require("./lib/error.js"),
	require("./lib/extend.js"),
	require("./lib/merge.js"),
	require("./lib/clone.js"),
	require("./lib/stub.js"),
	require("./lib/eval.js"),
];

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = { cls: {} };

// - -------------------------------------------------------------------- - //

modules.forEach(function(mod) {
	var keys = Object.keys(mod);
	var length = keys.length;
	for (var i = 0; i < length; i++) {
		var key = keys[i];
		if (key === "cls") {
			var classes = Object.keys(mod[key]);
			var clength = classes.length;
			for (var c = 0; c < clength; c++) {
				factory.cls[classes[c]] = mod[key][classes[c]];
			}
		} else {
			factory[key] = mod[key];
		}
	}
});

// - -------------------------------------------------------------------- - //

factory.extend({

	// .toArray(arg)
	toArray: function(arg) { return Array.prototype.slice.call(arg); },

});

// - -------------------------------------------------------------------- - //

factory.extend({

	// .guid()
	guid: function() {
	  var uid = "";
	  for (var i = 0; i < 8 ; i++) {
	    uid += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	  }
	  return uid;
	},

});

// - -------------------------------------------------------------------- - //

module.exports = exports = factory;

// - -------------------------------------------------------------------- - //

},{"./lib/class.js":2,"./lib/clone.js":3,"./lib/error.js":4,"./lib/eval.js":5,"./lib/extend.js":6,"./lib/inherits.js":7,"./lib/merge.js":8,"./lib/method.js":9,"./lib/property.js":10,"./lib/stub.js":11,"./lib/type.js":12}],2:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
  type: require("./type.js"),
  method: require("./method.js"),
  inherits: require("./inherits.js"),
  property: require("./property.js"),
};

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

// new Method(signatures)
var Method = lib.method.cls.Method;

// new Property()
var Property = lib.property.cls.Property;

// new Class(options)
function Class(name,options) {

  this.name = name || "";
  this.mixins = [];
  this.methods = {};
  this.properties = {};

  if (lib.type.isObject(options)) {
    var keys = Object.keys(options);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      var value = options[key];
      if (key === "constructor") {
        this.addConstructor(value);
      } else if (key === "inherits") {
        this.inherit(value);
      } else if (key === "mixins") {
        this.mixin(value);
      } else if (lib.type.isFunction(value) && lib.inherits.superOf(value,Property)) {
        this.addProperty(key,value);
      } else {
        this.addMethod(key,value);
      }
    }
  }

}

Class.prototype = {

  // .mixin(prototype)
  mixin: lib.method.createMethod({
    f: "this.mixins.push(f.prototype)",
    o: "this.mixins.push(o)",
  }),

  // .inherit(class)
  inherit: function(cls) {
    this.inherits = cls;
  },

  // .setName(name)
  setName: function(name) {
    this.name = name;
  },

  // .getMethod(name)
  getMethod: function(name) {
    if (!this.methods[name]) {
      this.methods[name] = new Method(name);
    }
    return this.methods[name];
  },

  // .addMethod(name, signatures)
  addMethod: function(name,signatures) {
    this.getMethod(name).addSignature(signatures);
  },

  // .addProperty(name, property)
  addProperty: function(name,property) {
    this.properties[name] = new property();
  },

  // .getConstructor()
  getConstructor: function() {
    if (!this._constructor) {
      this._constructor = new Method(this.name + "_constructor");
    }
    return this._constructor;
  },

  // .addConstructor(signatures)
  addConstructor: function(signatures) {
    this.getConstructor().addSignature(signatures);
  },

  // .toFunction()
  toFunction: function() {
    var constructor;
    if (this._constructor) {
      constructor = this._constructor.toFunction();
    }
    var inherits;
    if (this.inherits) {
      if (lib.type.isString(this.inherits)) {
        inherits = lib.inherits.resolve(this.inherits);
      } else {
        inherits = this.inherits;
      }
    }
    var code = "return function " + this.name + "() {";
    code += "inherits && inherits.apply(this,arguments);";
    code += "constructor && constructor.apply(this,arguments);";
    code += "}";
    var mkcls = new Function("constructor","inherits",code);
    var cls = mkcls(constructor,inherits);
    if (inherits) {
      lib.inherits.inherits(cls,inherits);
    }
    var mixlength = this.mixins.length;
    for (var i = 0; i < mixlength; i++) {
      var mixin = this.mixins[i];
      var names = Object.keys(mixin);
      var nlength = names.length;
      for (var n = 0; n < nlength; n++) {
        var name = names[n];
        cls.prototype[name] = mixin[name];
      }
    }
    var methods = Object.keys(this.methods);
    var metlength = methods.length;
    for (var m = 0; m < metlength; m++) {
      var name = methods[m];
      var method = this.methods[name];
      cls.prototype[name] = method.toFunction();
    }
    var properties = Object.keys(this.properties);
    var proplength = properties.length;
    for (var p = 0; p < proplength; p++) {
      var name = properties[p];
      var property = this.properties[name];
      Object.defineProperty(cls.prototype,name,property);
    }
    return cls;
  },

};

// - -------------------------------------------------------------------- - //

factory.createClass = factory.class = lib.method.createMethod({

  // .createClass(options)
  o: function(options) {
    var cls = new Class(null,options);
    return cls.toFunction();
  },

  // .createClass(name,options)
  so: function(name,options) {
    var cls = new Class(name,options);
    return cls.toFunction();
  },

});

// - -------------------------------------------------------------------- - //

factory.createObject = factory.object = lib.method.createMethod({

  // .createObject(options)
  o: function(options) {
    var cls = new Class(null,options);
    cls = cls.toFunction();
    return new cls();
  },

  // .createObject(name,options)
  so: function(name,options) {
    var cls = new Class(name,options);
    cls = cls.toFunction();
    return new cls();
  },

});

// - -------------------------------------------------------------------- - //

factory.cls = { Class: Class };

// - -------------------------------------------------------------------- - //

},{"./inherits.js":7,"./method.js":9,"./property.js":10,"./type.js":12}],3:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
  method: require("./method.js"),
};

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

factory.clone = lib.method.createMethod({

  // .clone(object)
  o: function(object) {
    var clone = {};
    var keys = Object.keys(object);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      var key = keys[i];
      clone[key] = factory.clone(object[key]);
    }
    return clone;
  },

  // .clone(array)
  a: function(array) {
    var clone = [];
    var len = array.length;
    for (var i = 0; i < len; i++) {
      clone[i] = factory.clone(array[i]);
    }
    return clone;
  },

  // .clone(date)
  d: function(date) {
    return new Date(date.getTime());
  },

  // .clone(arg)
  _: function(arg) {
    return arg;
  },

});

// - -------------------------------------------------------------------- - //

},{"./method.js":9}],4:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
  class: require("./class.js"),
  method: require("./method.js"),
};

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

// new Class(name,options)
var Class = lib.class.cls.Class;

factory.createError = factory.error = lib.method.createMethod({

  // .createError(name)
  s: function(name) {
    var cls = new Class(name,{
      inherits: Error,
      constructor: function(message) {
        this.name = name;
        this.message = message;
      },
    });
    return cls.toFunction();
  },

  // .createError(options)
  o: function(options) {
    var cls = new Class(null,options);
    cls.inherit(Error);
    return cls.toFunction();
  },

  // .createError(name,options)
  so: function(name,options) {
    var cls = new Class(name,options);
    var custom = new Class("CustomError",{
      inherits: Error,
      constructor: function(message) {
        this.name = name;
        this.message = message;
      },
    })
    cls.inherit(custom);
    return cls.toFunction();
  },

});

// - -------------------------------------------------------------------- - //

},{"./class.js":2,"./method.js":9}],5:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
    merge: require("./merge.js"),  
    class: require("./class.js"),
    method: require("./method.js"),  
};

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

var Evaluator = lib.class.createClass({
  
    // new Evaluator(expr,vars)
    constructor: function(expr,vars) {
        if (expr) {
            this.setExpr(expr);
        }
        if (vars) {
            this.setVars(vars);
        }      
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
            if (options.vars) {
                this.setVars(options.vars);
            }
            if (options.expr) {
                this.setExpr(options.expr);
            }        
        },
    
        // .setExpr(expr)
        s: function(expr) {
            
            var vars = {};
            var copy = expr.replace(/\.[a-zA-Z\_]+[a-zA-Z0-9\_]?/g,'');
            var names = copy.match(/([a-zA-Z\_]+[a-zA-Z0-9\_]?)/g);
            var length = names.length;
            var i;
            var name;
            var code;
            
            code = [
                "var vars = {};",
                "var argsLength = arguments.length;",
                "for (var i = 0; i < argsLength; i++) {",
                    "var arg = arguments[i];",
                    "if (arg instanceof Object) {",
                        "var names = Object.keys(arg);",
                        "var namesLength = names.length;",
                        "for (var n = 0; n < namesLength; n++) {",
                            "var name = names[n];",
                            "vars[name] = arg[name];",
                        "}",
                    "}",
                "}",
            ];
            
            for (i = 0; i < length; i++) {
                name = names[i];
                if (!vars[name]) {
                    vars[name] = true;
                    code.push("var " + name + " = vars['" + name + "'];");
                }
            }      
            
            code.push("return (" + expr + ");");
            code = code.join("\n");
            
            this.code = new Function(code);
            this.names = Object.keys(vars);
        },
    
  },
  
    // .evaluate(vars)
    evaluate: function(vars) {
        return this.code.call(this,this.vars,vars);
    },
  
});

// - -------------------------------------------------------------------- - //

factory.evaluator = factory.createEvaluator = lib.method.createMethod({

    // .createEvaluator(options)
    o: function(options) {
        return new Evaluator(options);
    },

    // .createEvaluator(expr)
    s: function(expr) {
        return new Evaluator(expr);
    },

    // .createEvaluator(expr,vars)
    so: function(expr,vars) {
        return new Evaluator(expr,vars);
    },
  
});

factory.isEvaluator = function(arg) {
    return arg instanceof Evaluator;
};

// - -------------------------------------------------------------------- - //

factory.cls = { 
    Evaluator: Evaluator 
};

// - -------------------------------------------------------------------- - //

},{"./class.js":2,"./merge.js":8,"./method.js":9}],6:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
  type: require("./type.js"),
  method: require("./method.js"),
};

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

factory.extend = lib.method.createMethod({

  // .extend(factory)
  o: function(methods) {
    var keys = Object.keys(methods);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      var key = keys[i];
      this[key] = lib.method.createMethod(methods[key]);
    }
    return factory;
  },

  // .extend(class,methods)
  fo: function(cls,methods) {
    var keys = Object.keys(methods);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      var key = keys[i];
      cls.prototype[key] = lib.method.createMethod(methods[key]);
    }
    return cls;
  },

  // .extend(target,source)
  oo: function(target,source) {
    var keys = Object.keys(source);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      var key = keys[i];
      target[key] = source[key];
    }
    return target;
  },

  // .extend(arg0, arg1, ...)
  _: function() {
    var target = arguments[0];
    var type = lib.type.typeOf(target);
    if (type === "object") {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        var srctype = lib.type.typeOf(source);
        if (srctype === "object") {
          var keys = Object.keys(source);
          var len = keys.length;
          for (var a = 0; a < len; a++) {
            var key = keys[a];
            target[key] = source[key];
          }
        }
      }
    } else if (type == "function") {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        var srctype = lib.type.typeOf(source);
        if (srctype === "object") {
          var keys = Object.keys(source);
          var len = keys.length;
          for (var a = 0; a < len; a++) {
            var key = keys[a];
            target.prototype[key] = lib.method.createMethod(source[key]);
          }
        }
      }
    }
    return target;
  },

});

// - -------------------------------------------------------------------- - //

},{"./method.js":9,"./type.js":12}],7:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
  type: require("./type.js"),
  method: require("./method.js"),
};

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

// .resolve(name)
factory.resolve = function(name) {
  var parts = name.split(".");
  var mod;
  while (parts.length > 0) {
    var part = parts.shift();
    if (mod) {
      mod = mod[part];
    } else {
      mod = require(part);
    }
  }
  return mod;
};

// - -------------------------------------------------------------------- - //

factory.inherits = lib.method.createMethod({

  // .inherits(class,super)
  fa: function(cls,superClass) {
    factory.inherits(cls,superClass[0]);
  },

  // .inherits(class,super)
  fs: function(cls,superClass) {
    superClass = lib.resolve.resolve(superClass);
    factory.inherits(cls,superClass);
  },

  // .inherits(class,super)
  ff: function(cls,superClass) {
    cls.super_ = superClass;
    cls.prototype = Object.create(superClass.prototype,{
      constructor: {
        value: cls,
        writable: true,
        enumerable: false,
        configurable: true,
      },
    });
  },

});

// - -------------------------------------------------------------------- - //

factory.super = factory.superOf = lib.method.createMethod({

  // .superOf(class)
  f: function(cls) {
    if (lib.type.isFunction(cls.super_)) {
      return cls.super_;
    }
  },

  // .superOf(class,name)
  fs: function(cls,superName) {
    var superClass = factory.resolve(superName);
    return factory.superOf(cls,superClass);
  },

  // .superOf(class,superClass)
  ff: function(cls,superClass) {
    var super_;
    while (lib.type.isFunction(cls.super_)) {
      if (cls.super_ === superClass) {
        super_ = cls.super_;
        break;
      }
      cls = cls.super_;
    }
    return super_;
  },

});

// - -------------------------------------------------------------------- - //

},{"./method.js":9,"./type.js":12}],8:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
  type: require("./type.js"),
  method: require("./method.js"),
};

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

factory.merge = lib.method.createMethod({

  // .merge(target,source)
  oo: function(target,source) {
    var keys = Object.keys(source);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      var key = keys[i];
      if (lib.type.isObject(source[key])) {
        if (!lib.type.isObject(target[key])) {
          target[key] = {};
        }
        factory.merge(target[key],source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  },

  // .merge(arg0, arg1, ...)
  _: function() {
    var target = arguments[0];
    var type = lib.type.typeOf(target);
    if (type === "object") {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        var srctype = lib.type.typeOf(source);
        if (srctype === "object") {
          factory.merge(target,source);
        }
      }
    }
    return target;
  },

});

// - -------------------------------------------------------------------- - //

},{"./method.js":9,"./type.js":12}],9:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
  type: require("./type.js"),
};

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

var regExp = {
  number: /^[0-9]+$/,
  letter: /^[a-z]+$/,
  index: /\$index\$/g,
};

var condExpr = {
  f: "typeof arguments[$index$] === 'function'",
  a: "arguments[$index$] instanceof Array",
  b: "(typeof arguments[$index$] === 'boolean' || arguments[$index$] instanceof Boolean)",
  s: "(typeof arguments[$index$] === 'string' || arguments[$index$] instanceof String)",
  n: "(typeof arguments[$index$] === 'number' || arguments[$index$] instanceof Number)",
  d: "arguments[$index$] instanceof Date",
  e: "arguments[$index$] instanceof Error",
  r: "arguments[$index$] instanceof RegExp",
  u: "(arguments[$index$] === null || typeof arguments[$index$] === 'undefined')",
  o: "Object.prototype.toString.call(arguments[$index$]) === '[object Object]'",
};

// - -------------------------------------------------------------------- - //

function parseArgs(signature) {
  var args = [];
  var count = {};
  var index = {};
  var length = signature.length;
  for (var i = 0; i < length; i++) {
    var arg = signature[i];
    if (count[arg]) {
      count[arg]++;
    } else {
      count[arg] = 1;
    }
    index[arg] = 0;
  }
  for (var i = 0; i < length; i++) {
    var arg = signature[i];
    if (count[arg] > 1) {
      args.push(arg + "" + index[arg]);
      index[arg]++;
    } else {
      args.push(arg);
    }
  }
  return args
}

function recurseTree(tree,level) {
  var code = "";
  var keys = Object.keys(tree).sort();
  var length = keys.length;
  for (var i = 0; i < length; i++) {
    var key = keys[i];
    var value = tree[key];
    var type = lib.type.typeOf(value);
    if (type === "object") {
      code += "if (";
      if (regExp.number.test(key)) {
        code += "len === " + key;
      } else if (regExp.letter.test(key)) {
        code += condExpr[key].replace(regExp.index,level);
      }
      code += ") {";
      code += recurseTree(value,level + 1);
      code += "}";
    } else if (type === "number") {
      code += "return functions[" + value + "].apply(this,arguments);";
    }
  }
  return code;
}

// - -------------------------------------------------------------------- - //

// new Method(name)
function Method(name,signatures) {
  this.name = name || "";
  this.tree = {};
  this.functions = [];
  if (lib.type.isObject(signatures) || lib.type.isFunction(signatures)) {
    this.addSignature(signatures);
  }
}

Method.prototype = {

  // .setName(name)
  setName: function(name) {
    this.name = name;
  },

  // .addFunction(function, arguments)
  addFunction: function(func,args) {
    var type = lib.type.typeOf(func);
    if (type === "string") {
      var fargs = [];
      if (args instanceof Array) {
        fargs.push.apply(fargs,args);
      }
      fargs.push(func);
      func = Function.constructor.apply(Function,fargs);
    } else if (type === "error") {
      func = function() { throw func };
    } else if (type === "object") {
      func = new Method(null,func).toFunction();
    } else if (type === "undefined") {
      func = function() {};
    }
    var index = this.functions.length;
    this.functions.push(func);
    return index;
  },

  // .addSignature(function)
  // .addSignature(signatures)
  // .addSignature(signature, function)
  addSignature: function() {
    if (arguments.length === 1) {
      var signatures = arguments[0];
      if (lib.type.isObject(signatures)) {
        var keys = Object.keys(signatures).sort();
        var length = keys.length;
        for (var i = length; i > 0; i--) {
          this.addSignature(keys[i-1],signatures[keys[i-1]]);
        }
      } else if (lib.type.isFunction(signatures)) {
        this.addSignature("_",signatures);
      }
    } else if (arguments.length === 2) {
      var signature = arguments[0];
      var func = arguments[1];
      if (signature === "_") {
        this.tree._ = this.addFunction(func);
      } else if (regExp.number.test(signature)) {
        (this.tree[signature] || (this.tree[signature] = {}))._ = this.addFunction(func);
      } else if (regExp.letter.test(signature)) {
        var length = signature.length;
        var tree = this.tree[length] || (this.tree[length] = {});
        for (var i = 0; i < length; i++) {
          tree = tree[signature[i]] || (tree[signature[i]] = {});
        }
        tree._ = this.addFunction(func,parseArgs(signature));
      }
    }
  },

  // .toFunction()
  toFunction: function() {
    var code = "return function " + this.name + "() {";
    code += "var len = arguments.length;";
    code += recurseTree(this.tree,-1);
    code += "throw new ReferenceError('signature not found');";
    code += "}";
    var func = new Function("functions",code);
    return func(this.functions);
  },

};

// - -------------------------------------------------------------------- - //
// - stuff

// function getFunctionCode(method) {
//   var methodText = method.toString();
//   var methodWithArgs = methodText.match(/function [\w]*\(([\w\,\s]+)\)\s*/);
//   if (methodWithArgs && methodWithArgs[1]) {
//     var methodCode = methodText.substr(methodWithArgs[0].length).trim().replace(/^\{|\}$/g,"").trim();
//     var methodArgs = methodWithArgs[1].split(/\s*,\s*/).map(function(arg,idx) {
//       return "var " + arg + " = arguments[" + idx + "];";
//     });
//     return methodArgs.join("\n") + "\n" + methodCode + ";return;";
//   } else {
//     var methodWithoutArgs = methodText.match(/function [\w]*\(\)\s*/);
//     if (methodWithoutArgs) {
//       var methodCode = methodText.substr(methodWithoutArgs[0].length).trim().replace(/^\{|\}$/g,"").trim();
//       return methodCode + ";return;";
//     }
//   }
// }
//
//   if (embedCode) {
//     var methodsCode = methods.map(getFunctionCode);
//     var code = recurseMethodTree(tree,-1,methodsCode);
//     code.unshift("var len = arguments.length;");
//     code.push("throw new ReferenceError('signature not found');");
//     code = code.join("\n");
//     return new Function(code);
//   } else {
//     var code = recurseMethodTree(tree,-1);
//     code.unshift("return function() {","var len = arguments.length;");
//     code.push("throw new ReferenceError('signature not found');","}");
//     code = code.join("\n");
//     return new Function("methods",code)(methods);
//   }
// }

// - -------------------------------------------------------------------- - //

factory.createMethod = factory.method = new Method("createMethod",{

	// .createMethod(function)
	f: "return f",

	// .createMethod(error)
	e: "return function() { throw e }",

	// .createMethod(code)
	s: "return new Function(s)",

	// .createMethod(undefined)
	u: "return function() {}",

  // .createMethod(signatures)
  o: function(signatures) {
    return new Method(null,signatures).toFunction();
  },

  // .createMethod(name, signatures)
  so: function(name,signatures) {
    return new Method(name,signatures).toFunction();
  },

  // .createMethod(name, function)
  sf: function(name,signatures) {
    return new Method(name,signatures).toFunction();
  },

}).toFunction();

factory.cls = { Method: Method };

// - -------------------------------------------------------------------- - //

},{"./type.js":12}],10:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
  method: require("./method.js"),
  extend: require("./extend.js"),
  inherits: require("./inherits.js"),
};

// - -------------------------------------------------------------------- - //
// - Exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

// new Property()
var Property = function() {};

Property.prototype = {
  name: "Property",
  enumerable: true,
  configurable: true,
  get: function() { return this.value; },
  set: function(value) { this.value = value; },
};

factory.property = factory.createProperty = lib.method.createMethod({

  // .createProperty(name)
  s: function(name) {
    var CustomProperty = lib.method.createMethod(name,function() {});
    lib.inherits.inherits(CustomProperty,Property);
    lib.extend.extend(CustomProperty,{ name: name });
    return CustomProperty;
  },

  // .createProperty(options)
  o: function(options) {
    var CustomProperty = function() {};
    lib.inherits.inherits(CustomProperty,Property);
    lib.extend.extend(CustomProperty,options);
    return CustomProperty;
  },

  // .createProperty(name,options)
  so: function(name,options) {
    var CustomProperty = lib.method.createMethod(name,function() {});
    lib.inherits.inherits(CustomProperty,Property);
    lib.extend.extend(CustomProperty,{ name: name });
    lib.extend.extend(CustomProperty,options);
    return CustomProperty;
  },

});

// - -------------------------------------------------------------------- - //

factory.cls = { Property: Property };

// - -------------------------------------------------------------------- - //

},{"./extend.js":6,"./inherits.js":7,"./method.js":9}],11:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - Libs

var lib = {
  type: require("./type.js"),
  assert: require("assert"),
};

// - -------------------------------------------------------------------- - //
// - exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

// Checks if two arguments are equal.
function matchArgs(one,two) {
  var match = false;
  if (one === two) {
    match = true;
  } else if (lib.type.isArray(one) || lib.type.isObject(one)) {
    try {
      lib.assert.deepEqual(one,two);
      match = true;
    } catch(e) {
    }
  } else {
    try {
      lib.assert.strictEqual(one,two);
      match = true;
    } catch(e) {
    }
  }
  return match;
}

// Count how many times stub have been called with passed arguments.
function calledWith() {
  var calledWithCount = 0;
  var args = [];
  var argsLength = arguments.length;
  for (var i = 0; i < argsLength; i++) {
    args[i] = arguments[i];
  }
  var callsLength = this._calls.length;
  CALLS: for (var i = 0; i < callsLength; i++) {
    var match = false;
    var called = this._calls[i];
    var calledLength = called.length;
    if (argsLength === 0 && calledLength === 0) {
      match = true;
    } else {
      ARGS: for (var a = 0; a < argsLength; a++) {
        match = matchArgs(args[a],called[a]);
        if (!match) {
          break ARGS;
        }
      }
    }
    if (match) {
      calledWithCount++;
    }
  }
  return calledWithCount;
}

// Checks if stub have been called one time with passed arguments.
function calledOnceWith() {
  return this.calledWith.apply(this,arguments) === 1;
}

// Checks if stub have been called one time.
function calledOnce() {
  return this._calls.length === 1;
}

// Checks if stub have not been called.
function notCalled() {
  return this._calls.length === 0;
}

// Returns number of times stub have been called.
function called() {
  return this._calls.length;
}

// Defines arguments to be used by stub pass to callbacks when called.
function callbackWith() {
  this._callbackWith = [];
  var length = arguments.length;
  for (var i = 0; i < length; i++) {
    var arg = arguments[i];
    this._callbackWith.push(arg);
  }
  return this;
}

// Defines a value to be returned by stub.
function returns(value) {
  this._returns = value;
  return this;
}

// - -------------------------------------------------------------------- - //

// .stub(value)
factory.createStub = factory.stub = function(opts) {

  var newStub; newStub = function() {
    var args = [];
    var callbacks = [];
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
      var arg = arguments[i];
      args.push(arg);
      if (lib.type.isFunction(arg)) {
        callbacks.push(i);
      }
    }
    newStub._calls.push(args);
    if (newStub._callbackWith instanceof Array) {
      var idx = callbacks.pop();
      if (args[idx]) {
        args[idx].apply(this,newStub._callbackWith);
      }
    }
    return newStub._returns;
  };

  newStub._calls = [];
  if (lib.type.isObject(opts)) {
    newStub._returns = opts.returns;
    newStub._callbackWith = opts.callbackWith;
  }

  // .returns(value)
  newStub.returns = returns.bind(newStub);

  // .callbackWith(...)
  newStub.callbackWith = callbackWith.bind(newStub);

  // .called() : Number
  newStub.called = called.bind(newStub);

  // .notCalled() : Boolean
  newStub.notCalled = notCalled.bind(newStub);

  // .calledOnce() : Boolean
  newStub.calledOnce = calledOnce.bind(newStub);

  // .calledWith(...) : Number
  newStub.calledWith = calledWith.bind(newStub);

  // .calledOnceWith(...) : Boolean
  newStub.calledOnceWith = calledOnceWith.bind(newStub);

  return newStub;
}

// - -------------------------------------------------------------------- - //

},{"./type.js":12,"assert":13}],12:[function(require,module,exports){
/*!
**  bauer-factory -- General utilities for nodejs.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-factory>
*/

// - -------------------------------------------------------------------- - //
// - exports

var factory = module.exports = {};

// - -------------------------------------------------------------------- - //

// .type(value)
factory.typeOf = factory.type = function(arg) {
	var type = typeof arg;
	if (type === "object") {
		if (arg === null) {
			type = "null";
		} else if (arg instanceof Error) {
			type = "error";
		} else if (arg instanceof Array) {
			type = "array";
		} else if (arg instanceof Date) {
			type = "date";
		} else if (arg instanceof RegExp) {
			type = "regexp";
		} else if (arg instanceof String) {
			type = "string";
		} else if (arg instanceof Number) {
			type = "number";
		} else if (arg instanceof Boolean) {
			type = "boolean";
		} else {
			var toString = Object.prototype.toString.call(arg);
			if (toString === "[object Arguments]") {
				type = "arguments";
			}
		}
	}
	return type;
}

// - -------------------------------------------------------------------- - //

// .isNull(arg)
factory.isNull = function(arg) { return factory.typeOf(arg) === "null" };

// .isDefined(arg)
factory.isDefined = function(arg) { return factory.typeOf(arg) !== "undefined" };

// .isUndefined(arg)
factory.isUndefined = function(arg) { return factory.typeOf(arg) === "undefined" };

// .isDate(arg)
factory.isDate = function(arg) { return factory.typeOf(arg) === "date" };

// .isError(arg)
factory.isError = function(arg) { return factory.typeOf(arg) === "error" };

// .isArray(arg)
factory.isArray = function(arg) { return factory.typeOf(arg) === "array" };

// .isNumber(arg)
factory.isNumber = function(arg) { return factory.typeOf(arg) === "number" };

// .isString(arg)
factory.isString = function(arg) { return factory.typeOf(arg) === "string" };

// .isObject(arg)
factory.isObject = function(arg) { return factory.typeOf(arg) === "object" };

// .isRegExp(arg)
factory.isRegExp = function(arg) { return factory.typeOf(arg) === "regexp" };

// .isBoolean(arg)
factory.isBoolean = function(arg) { return factory.typeOf(arg) === "boolean" };

// .isFunction(arg)
factory.isFunction = function(arg) { return factory.typeOf(arg) === "function" };

// .isArguments(arg)
factory.isArguments = function(arg) { return factory.typeOf(arg) === "arguments" };

// - -------------------------------------------------------------------- - //

// .ifNull(arg)
factory.ifNull = function(arg,other) { return factory.typeOf(arg) === "null" ? arg : other };

// .ifDefined(arg)
factory.ifDefined = function(arg,other) { return factory.typeOf(arg) !== "undefined" ? arg : other };

// .ifUndefined(arg)
factory.ifUndefined = function(arg,other) { return factory.typeOf(arg) === "undefined" ? arg : other };

// .ifDate(arg)
factory.ifDate = function(arg,other) { return factory.typeOf(arg) === "date" ? arg : other };

// .ifError(arg)
factory.ifError = function(arg,other) { return factory.typeOf(arg) === "error" ? arg : other };

// .ifArray(arg)
factory.ifArray = function(arg,other) { return factory.typeOf(arg) === "array" ? arg : other };

// .ifNumber(arg)
factory.ifNumber = function(arg,other) { return factory.typeOf(arg) === "number" ? arg : other };

// .ifString(arg)
factory.ifString = function(arg,other) { return factory.typeOf(arg) === "string" ? arg : other };

// .ifObject(arg)
factory.ifObject = function(arg,other) { return factory.typeOf(arg) === "object" ? arg : other };

// .ifRegExp(arg)
factory.ifRegExp = function(arg,other) { return factory.typeOf(arg) === "regexp" ? arg : other };

// .ifBoolean(arg)
factory.ifBoolean = function(arg,other) { return factory.typeOf(arg) === "boolean" ? arg : other };

// .ifFunction(arg)
factory.ifFunction = function(arg,other) { return factory.typeOf(arg) === "function" ? arg : other };

// .ifArguments(arg)
factory.ifArguments = function(arg,other) { return factory.typeOf(arg) === "arguments" ? arg : other };

// - -------------------------------------------------------------------- - //

},{}],13:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && !isFinite(value)) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":18}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],15:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],16:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],17:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],18:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":17,"_process":16,"inherits":15}],19:[function(require,module,exports){
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

},{"bauer-factory":1,"events":14}],20:[function(require,module,exports){
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

},{"./area.js":19,"./interaction.js":21,"./interactions/draggable.js":22,"./layout.js":23,"bauer-factory":1}],21:[function(require,module,exports){
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

},{"bauer-factory":1,"events":14}],22:[function(require,module,exports){
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

},{"../interaction.js":21,"bauer-factory":1}],23:[function(require,module,exports){
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

},{"./pointer.js":24,"bauer-factory":1,"events":14}],24:[function(require,module,exports){
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

},{"bauer-factory":1,"events":14}]},{},[20]);
