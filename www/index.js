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

},{"./lib/class.js":2,"./lib/clone.js":3,"./lib/error.js":4,"./lib/extend.js":5,"./lib/inherits.js":6,"./lib/merge.js":7,"./lib/method.js":8,"./lib/property.js":9,"./lib/stub.js":10,"./lib/type.js":11}],2:[function(require,module,exports){
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

},{"./inherits.js":6,"./method.js":8,"./property.js":9,"./type.js":11}],3:[function(require,module,exports){
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

},{"./method.js":8}],4:[function(require,module,exports){
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

},{"./class.js":2,"./method.js":8}],5:[function(require,module,exports){
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

},{"./method.js":8,"./type.js":11}],6:[function(require,module,exports){
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

},{"./method.js":8,"./type.js":11}],7:[function(require,module,exports){
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

},{"./method.js":8,"./type.js":11}],8:[function(require,module,exports){
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

},{"./type.js":11}],9:[function(require,module,exports){
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

},{"./extend.js":5,"./inherits.js":6,"./method.js":8}],10:[function(require,module,exports){
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

},{"./type.js":11,"assert":12}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"util/":17}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],17:[function(require,module,exports){
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
},{"./support/isBuffer":16,"_process":15,"inherits":14}],18:[function(require,module,exports){
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

},{"./parser.js":21,"bauer-factory":1,"events":13}],19:[function(require,module,exports){
// - -------------------------------------------------------------------- - //
// - Libs

var factory = require("bauer-factory");
var Layout = require("./layout.js");
var Element = require("./element.js");

// - -------------------------------------------------------------------- - //
// - Init

window.onload = function() {

  var layout = new Layout(document.body);

  var a = new Element({
    top: 20,
    left: 20,
    width: 100,
    height: 100,
  });
  
  var b = new Element({
    top: 20,
    left: a.id + "_left + 120",
    width: 100,
    height: 100,
  });
  
  var c = new Element({
    top: 20,
    left: b.id + "_left + 120",
    width: 100,
    height: 100,
  });
  
  var d = new Element({
    bottom: 20,
    left: 20,
    width: 100,
    height: 100,
  });
  
  layout.add(a,b,c,d);
  
  layout.place();
  
};


// - -------------------------------------------------------------------- - //

},{"./element.js":18,"./layout.js":20,"bauer-factory":1}],20:[function(require,module,exports){
// - -------------------------------------------------------------------- - //
// - Libs

var events = require("events");
var factory = require("bauer-factory");
var Pointer = require("./pointer.js");

// - -------------------------------------------------------------------- - //
// - Layout

var Layout = factory.class({

  inherits: events.EventEmitter,
  
  // new Layout(root)
  constructor: function(root) {
    this.root = root;
    this.elements = [];
    this.init();
  },
  
  // .init()
  init: function() {
    
    this.pointer = new Pointer(this.root);
    
    this.pointer.on("click",function(event) {
      console.log("click",event);
    });
    
    this.pointer.on("rightclick",function(event) {
      console.log("rightclick",event);
    });
    
    this.pointer.on("dragstart",function(event) {
      console.log("dragstart",event);
    });
    
    this.pointer.on("dragstop",function(event) {
      console.log("dragstop",event);
    });
    
    this.pointer.on("dragmove",function(event) {
      console.log("dragmove",event);
    });
    
  },
  
  // .add(element, ...)
  add: function() {
    var length = arguments.length;
    for (var i = 0; i < length; i++) {
      var element = arguments[i];
      this.elements[element.id] = element;
      this.root.appendChild(element.node);      
    }    
  },
  
  // .place()
  place: function() {
    var ids = Object.keys(this.elements);
    var length = ids.length;
    var ok = 0;
    var attr = {};
    CYCLES: for (var c = 0; c < 10; c++) {      
      ELEMENTS: for (var i = 0; i < length; i++) {
        var id = ids[i];
        var element = this.elements[id];
        if (element.place(attr)) {
          ok++
        }
      }
      if (ok === length) {
        break CYCLES;
      }
    }    
  },
  
});

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = Layout;

// - -------------------------------------------------------------------- - //

},{"./pointer.js":22,"bauer-factory":1,"events":13}],21:[function(require,module,exports){
/*!
 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
 http://www.undefined.ch/mparser/index.html

 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 but don't feel like you have to let me know or ask permission.
*/

//  Added by stlsmiths 6/13/2011
//  re-define Array.indexOf, because IE doesn't know it ...
//
//  from http://stellapower.net/content/javascript-support-and-arrayindexof-ie
	if (!Array.indexOf) {
		Array.prototype.indexOf = function (obj, start) {
			for (var i = (start || 0); i < this.length; i++) {
				if (this[i] === obj) {
					return i;
				}
			}
			return -1;
		}
	}

var Parser = (function (scope) {
	function object(o) {
		function F() {}
		F.prototype = o;
		return new F();
	}

	var TNUMBER = 0;
	var TOP1 = 1;
	var TOP2 = 2;
	var TVAR = 3;
	var TFUNCALL = 4;

	function Token(type_, index_, prio_, number_) {
		this.type_ = type_;
		this.index_ = index_ || 0;
		this.prio_ = prio_ || 0;
		this.number_ = (number_ !== undefined && number_ !== null) ? number_ : 0;
		this.toString = function () {
			switch (this.type_) {
			case TNUMBER:
				return this.number_;
			case TOP1:
			case TOP2:
			case TVAR:
				return this.index_;
			case TFUNCALL:
				return "CALL";
			default:
				return "Invalid Token";
			}
		};
	}

	function Expression(tokens, ops1, ops2, functions) {
		this.tokens = tokens;
		this.ops1 = ops1;
		this.ops2 = ops2;
		this.functions = functions;
	}

	// Based on http://www.json.org/json2.js
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            "'" : "\\'",
            '\\': '\\\\'
        };

	function escapeValue(v) {
		if (typeof v === "string") {
			escapable.lastIndex = 0;
	        return escapable.test(v) ?
	            "'" + v.replace(escapable, function (a) {
	                var c = meta[a];
	                return typeof c === 'string' ? c :
	                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	            }) + "'" :
	            "'" + v + "'";
		}
		return v;
	}

	Expression.prototype = {
		simplify: function (values) {
			values = values || {};
			var nstack = [];
			var newexpression = [];
			var n1;
			var n2;
			var f;
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TNUMBER) {
					nstack.push(item);
				}
				else if (type_ === TVAR && (item.index_ in values)) {
					item = new Token(TNUMBER, 0, 0, values[item.index_]);
					nstack.push(item);
				}
				else if (type_ === TOP2 && nstack.length > 1) {
					n2 = nstack.pop();
					n1 = nstack.pop();
					f = this.ops2[item.index_];
					item = new Token(TNUMBER, 0, 0, f(n1.number_, n2.number_));
					nstack.push(item);
				}
				else if (type_ === TOP1 && nstack.length > 0) {
					n1 = nstack.pop();
					f = this.ops1[item.index_];
					item = new Token(TNUMBER, 0, 0, f(n1.number_));
					nstack.push(item);
				}
				else {
					while (nstack.length > 0) {
						newexpression.push(nstack.shift());
					}
					newexpression.push(item);
				}
			}
			while (nstack.length > 0) {
				newexpression.push(nstack.shift());
			}

			return new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
		},

		substitute: function (variable, expr) {
			if (!(expr instanceof Expression)) {
				expr = new Parser().parse(String(expr));
			}
			var newexpression = [];
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TVAR && item.index_ === variable) {
					for (var j = 0; j < expr.tokens.length; j++) {
						var expritem = expr.tokens[j];
						var replitem = new Token(expritem.type_, expritem.index_, expritem.prio_, expritem.number_);
						newexpression.push(replitem);
					}
				}
				else {
					newexpression.push(item);
				}
			}

			var ret = new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
			return ret;
		},

		evaluate: function (values) {
			values = values || {};
			var nstack = [];
			var n1;
			var n2;
			var f;
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TNUMBER) {
					nstack.push(item.number_);
				}
				else if (type_ === TOP2) {
					n2 = nstack.pop();
					n1 = nstack.pop();
					f = this.ops2[item.index_];
					nstack.push(f(n1, n2));
				}
				else if (type_ === TVAR) {
					if (item.index_ in values) {
						nstack.push(values[item.index_]);
					}
					else if (item.index_ in this.functions) {
						nstack.push(this.functions[item.index_]);
					}
					else {
						throw new Error("undefined variable: " + item.index_);
					}
				}
				else if (type_ === TOP1) {
					n1 = nstack.pop();
					f = this.ops1[item.index_];
					nstack.push(f(n1));
				}
				else if (type_ === TFUNCALL) {
					n1 = nstack.pop();
					f = nstack.pop();
					if (f.apply && f.call) {
						if (Object.prototype.toString.call(n1) == "[object Array]") {
							nstack.push(f.apply(undefined, n1));
						}
						else {
							nstack.push(f.call(undefined, n1));
						}
					}
					else {
						throw new Error(f + " is not a function");
					}
				}
				else {
					throw new Error("invalid Expression");
				}
			}
			if (nstack.length > 1) {
				throw new Error("invalid Expression (parity)");
			}
			return nstack[0];
		},

		toString: function (toJS) {
			var nstack = [];
			var n1;
			var n2;
			var f;
			var L = this.tokens.length;
			var item;
			var i = 0;
			for (i = 0; i < L; i++) {
				item = this.tokens[i];
				var type_ = item.type_;
				if (type_ === TNUMBER) {
					nstack.push(escapeValue(item.number_));
				}
				else if (type_ === TOP2) {
					n2 = nstack.pop();
					n1 = nstack.pop();
					f = item.index_;
					if (toJS && f == "^") {
						nstack.push("Math.pow(" + n1 + "," + n2 + ")");
					}
					else {
						nstack.push("(" + n1 + f + n2 + ")");
					}
				}
				else if (type_ === TVAR) {
					nstack.push(item.index_);
				}
				else if (type_ === TOP1) {
					n1 = nstack.pop();
					f = item.index_;
					if (f === "-") {
						nstack.push("(" + f + n1 + ")");
					}
					else {
						nstack.push(f + "(" + n1 + ")");
					}
				}
				else if (type_ === TFUNCALL) {
					n1 = nstack.pop();
					f = nstack.pop();
					nstack.push(f + "(" + n1 + ")");
				}
				else {
					throw new Error("invalid Expression");
				}
			}
			if (nstack.length > 1) {
				throw new Error("invalid Expression (parity)");
			}
			return nstack[0];
		},

		variables: function () {
			var L = this.tokens.length;
			var vars = [];
			for (var i = 0; i < L; i++) {
				var item = this.tokens[i];
				if (item.type_ === TVAR && (vars.indexOf(item.index_) == -1)) {
					vars.push(item.index_);
				}
			}

			return vars;
		},

		toJSFunction: function (param, variables) {
			var f = new Function(param, "with(Parser.values) { return " + this.simplify(variables).toString(true) + "; }");
			return f;
		}
	};

	function add(a, b) {
		return Number(a) + Number(b);
	}
	function sub(a, b) {
		return a - b; 
	}
	function mul(a, b) {
		return a * b;
	}
	function div(a, b) {
		return a / b;
	}
	function mod(a, b) {
		return a % b;
	}
	function concat(a, b) {
		return "" + a + b;
	}

	function log10(a) {
	      return Math.log(a) * Math.LOG10E;
	}
	function neg(a) {
		return -a;
	}

	function random(a) {
		return Math.random() * (a || 1);
	}
	function fac(a) { //a!
		a = Math.floor(a);
		var b = a;
		while (a > 1) {
			b = b * (--a);
		}
		return b;
	}

	// TODO: use hypot that doesn't overflow
	function pyt(a, b) {
		return Math.sqrt(a * a + b * b);
	}

	function append(a, b) {
		if (Object.prototype.toString.call(a) != "[object Array]") {
			return [a, b];
		}
		a = a.slice();
		a.push(b);
		return a;
	}

	function Parser() {
		this.success = false;
		this.errormsg = "";
		this.expression = "";

		this.pos = 0;

		this.tokennumber = 0;
		this.tokenprio = 0;
		this.tokenindex = 0;
		this.tmpprio = 0;

		this.ops1 = {
			"sin": Math.sin,
			"cos": Math.cos,
			"tan": Math.tan,
			"asin": Math.asin,
			"acos": Math.acos,
			"atan": Math.atan,
			"sqrt": Math.sqrt,
			"log": Math.log,
			"lg" : log10,
			"log10" : log10,
			"abs": Math.abs,
			"ceil": Math.ceil,
			"floor": Math.floor,
			"round": Math.round,
			"-": neg,
			"exp": Math.exp
		};

		this.ops2 = {
			"+": add,
			"-": sub,
			"*": mul,
			"/": div,
			"%": mod,
			"^": Math.pow,
			",": append,
			"||": concat
		};

		this.functions = {
			"random": random,
			"fac": fac,
			"min": Math.min,
			"max": Math.max,
			"pyt": pyt,
			"pow": Math.pow,
			"atan2": Math.atan2
		};

		this.consts = {
			"E": Math.E,
			"PI": Math.PI
		};
	}

	Parser.parse = function (expr) {
		return new Parser().parse(expr);
	};

	Parser.evaluate = function (expr, variables) {
		return Parser.parse(expr).evaluate(variables);
	};

	Parser.Expression = Expression;

	Parser.values = {
		sin: Math.sin,
		cos: Math.cos,
		tan: Math.tan,
		asin: Math.asin,
		acos: Math.acos,
		atan: Math.atan,
		sqrt: Math.sqrt,
		log: Math.log,
		lg: log10,
		log10: log10,
		abs: Math.abs,
		ceil: Math.ceil,
		floor: Math.floor,
		round: Math.round,
		random: random,
		fac: fac,
		exp: Math.exp,
		min: Math.min,
		max: Math.max,
		pyt: pyt,
		pow: Math.pow,
		atan2: Math.atan2,
		E: Math.E,
		PI: Math.PI
	};

	var PRIMARY      = 1 << 0;
	var OPERATOR     = 1 << 1;
	var FUNCTION     = 1 << 2;
	var LPAREN       = 1 << 3;
	var RPAREN       = 1 << 4;
	var COMMA        = 1 << 5;
	var SIGN         = 1 << 6;
	var CALL         = 1 << 7;
	var NULLARY_CALL = 1 << 8;

	Parser.prototype = {
		parse: function (expr) {
			this.errormsg = "";
			this.success = true;
			var operstack = [];
			var tokenstack = [];
			this.tmpprio = 0;
			var expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
			var noperators = 0;
			this.expression = expr;
			this.pos = 0;

			while (this.pos < this.expression.length) {
				if (this.isOperator()) {
					if (this.isSign() && (expected & SIGN)) {
						if (this.isNegativeSign()) {
							this.tokenprio = 2;
							this.tokenindex = "-";
							noperators++;
							this.addfunc(tokenstack, operstack, TOP1);
						}
						expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
					}
					else if (this.isComment()) {

					}
					else {
						if ((expected & OPERATOR) === 0) {
							this.error_parsing(this.pos, "unexpected operator");
						}
						noperators += 2;
						this.addfunc(tokenstack, operstack, TOP2);
						expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
					}
				}
				else if (this.isNumber()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected number");
					}
					var token = new Token(TNUMBER, 0, 0, this.tokennumber);
					tokenstack.push(token);

					expected = (OPERATOR | RPAREN | COMMA);
				}
				else if (this.isString()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected string");
					}
					var token = new Token(TNUMBER, 0, 0, this.tokennumber);
					tokenstack.push(token);

					expected = (OPERATOR | RPAREN | COMMA);
				}
				else if (this.isLeftParenth()) {
					if ((expected & LPAREN) === 0) {
						this.error_parsing(this.pos, "unexpected \"(\"");
					}

					if (expected & CALL) {
						noperators += 2;
						this.tokenprio = -2;
						this.tokenindex = -1;
						this.addfunc(tokenstack, operstack, TFUNCALL);
					}

					expected = (PRIMARY | LPAREN | FUNCTION | SIGN | NULLARY_CALL);
				}
				else if (this.isRightParenth()) {
				    if (expected & NULLARY_CALL) {
						var token = new Token(TNUMBER, 0, 0, []);
						tokenstack.push(token);
					}
					else if ((expected & RPAREN) === 0) {
						this.error_parsing(this.pos, "unexpected \")\"");
					}

					expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
				}
				else if (this.isComma()) {
					if ((expected & COMMA) === 0) {
						this.error_parsing(this.pos, "unexpected \",\"");
					}
					this.addfunc(tokenstack, operstack, TOP2);
					noperators += 2;
					expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
				}
				else if (this.isConst()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected constant");
					}
					var consttoken = new Token(TNUMBER, 0, 0, this.tokennumber);
					tokenstack.push(consttoken);
					expected = (OPERATOR | RPAREN | COMMA);
				}
				else if (this.isOp2()) {
					if ((expected & FUNCTION) === 0) {
						this.error_parsing(this.pos, "unexpected function");
					}
					this.addfunc(tokenstack, operstack, TOP2);
					noperators += 2;
					expected = (LPAREN);
				}
				else if (this.isOp1()) {
					if ((expected & FUNCTION) === 0) {
						this.error_parsing(this.pos, "unexpected function");
					}
					this.addfunc(tokenstack, operstack, TOP1);
					noperators++;
					expected = (LPAREN);
				}
				else if (this.isVar()) {
					if ((expected & PRIMARY) === 0) {
						this.error_parsing(this.pos, "unexpected variable");
					}
					var vartoken = new Token(TVAR, this.tokenindex, 0, 0);
					tokenstack.push(vartoken);

					expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
				}
				else if (this.isWhite()) {
				}
				else {
					if (this.errormsg === "") {
						this.error_parsing(this.pos, "unknown character");
					}
					else {
						this.error_parsing(this.pos, this.errormsg);
					}
				}
			}
			if (this.tmpprio < 0 || this.tmpprio >= 10) {
				this.error_parsing(this.pos, "unmatched \"()\"");
			}
			while (operstack.length > 0) {
				var tmp = operstack.pop();
				tokenstack.push(tmp);
			}
			if (noperators + 1 !== tokenstack.length) {
				//print(noperators + 1);
				//print(tokenstack);
				this.error_parsing(this.pos, "parity");
			}

			return new Expression(tokenstack, object(this.ops1), object(this.ops2), object(this.functions));
		},

		evaluate: function (expr, variables) {
			return this.parse(expr).evaluate(variables);
		},

		error_parsing: function (column, msg) {
			this.success = false;
			this.errormsg = "parse error [column " + (column) + "]: " + msg;
			throw new Error(this.errormsg);
		},

//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

		addfunc: function (tokenstack, operstack, type_) {
			var operator = new Token(type_, this.tokenindex, this.tokenprio + this.tmpprio, 0);
			while (operstack.length > 0) {
				if (operator.prio_ <= operstack[operstack.length - 1].prio_) {
					tokenstack.push(operstack.pop());
				}
				else {
					break;
				}
			}
			operstack.push(operator);
		},

		isNumber: function () {
			var r = false;
			var str = "";
			while (this.pos < this.expression.length) {
				var code = this.expression.charCodeAt(this.pos);
				if ((code >= 48 && code <= 57) || code === 46) {
					str += this.expression.charAt(this.pos);
					this.pos++;
					this.tokennumber = parseFloat(str);
					r = true;
				}
				else {
					break;
				}
			}
			return r;
		},

		// Ported from the yajjl JSON parser at http://code.google.com/p/yajjl/
		unescape: function(v, pos) {
			var buffer = [];
			var escaping = false;

			for (var i = 0; i < v.length; i++) {
				var c = v.charAt(i);
	
				if (escaping) {
					switch (c) {
					case "'":
						buffer.push("'");
						break;
					case '\\':
						buffer.push('\\');
						break;
					case '/':
						buffer.push('/');
						break;
					case 'b':
						buffer.push('\b');
						break;
					case 'f':
						buffer.push('\f');
						break;
					case 'n':
						buffer.push('\n');
						break;
					case 'r':
						buffer.push('\r');
						break;
					case 't':
						buffer.push('\t');
						break;
					case 'u':
						// interpret the following 4 characters as the hex of the unicode code point
						var codePoint = parseInt(v.substring(i + 1, i + 5), 16);
						buffer.push(String.fromCharCode(codePoint));
						i += 4;
						break;
					default:
						throw this.error_parsing(pos + i, "Illegal escape sequence: '\\" + c + "'");
					}
					escaping = false;
				} else {
					if (c == '\\') {
						escaping = true;
					} else {
						buffer.push(c);
					}
				}
			}
	
			return buffer.join('');
		},

		isString: function () {
			var r = false;
			var str = "";
			var startpos = this.pos;
			if (this.pos < this.expression.length && this.expression.charAt(this.pos) == "'") {
				this.pos++;
				while (this.pos < this.expression.length) {
					var code = this.expression.charAt(this.pos);
					if (code != "'" || str.slice(-1) == "\\") {
						str += this.expression.charAt(this.pos);
						this.pos++;
					}
					else {
						this.pos++;
						this.tokennumber = this.unescape(str, startpos);
						r = true;
						break;
					}
				}
			}
			return r;
		},

		isConst: function () {
			var str;
			for (var i in this.consts) {
				if (true) {
					var L = i.length;
					str = this.expression.substr(this.pos, L);
					if (i === str) {
						this.tokennumber = this.consts[i];
						this.pos += L;
						return true;
					}
				}
			}
			return false;
		},

		isOperator: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 43) { // +
				this.tokenprio = 0;
				this.tokenindex = "+";
			}
			else if (code === 45) { // -
				this.tokenprio = 0;
				this.tokenindex = "-";
			}
			else if (code === 124) { // |
				if (this.expression.charCodeAt(this.pos + 1) === 124) {
					this.pos++;
					this.tokenprio = 0;
					this.tokenindex = "||";
				}
				else {
					return false;
				}
			}
			else if (code === 42 || code === 8729 || code === 8226) { // * or ∙ or •
				this.tokenprio = 1;
				this.tokenindex = "*";
			}
			else if (code === 47) { // /
				this.tokenprio = 2;
				this.tokenindex = "/";
			}
			else if (code === 37) { // %
				this.tokenprio = 2;
				this.tokenindex = "%";
			}
			else if (code === 94) { // ^
				this.tokenprio = 3;
				this.tokenindex = "^";
			}
			else {
				return false;
			}
			this.pos++;
			return true;
		},

		isSign: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 45 || code === 43) { // -
				return true;
			}
			return false;
		},

		isPositiveSign: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 43) { // +
				return true;
			}
			return false;
		},

		isNegativeSign: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 45) { // -
				return true;
			}
			return false;
		},

		isLeftParenth: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 40) { // (
				this.pos++;
				this.tmpprio += 10;
				return true;
			}
			return false;
		},

		isRightParenth: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 41) { // )
				this.pos++;
				this.tmpprio -= 10;
				return true;
			}
			return false;
		},

		isComma: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 44) { // ,
				this.pos++;
				this.tokenprio = -1;
				this.tokenindex = ",";
				return true;
			}
			return false;
		},

		isWhite: function () {
			var code = this.expression.charCodeAt(this.pos);
			if (code === 32 || code === 9 || code === 10 || code === 13) {
				this.pos++;
				return true;
			}
			return false;
		},

		isOp1: function () {
			var str = "";
			for (var i = this.pos; i < this.expression.length; i++) {
				var c = this.expression.charAt(i);
				if (c.toUpperCase() === c.toLowerCase()) {
					if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
						break;
					}
				}
				str += c;
			}
			if (str.length > 0 && (str in this.ops1)) {
				this.tokenindex = str;
				this.tokenprio = 5;
				this.pos += str.length;
				return true;
			}
			return false;
		},

		isOp2: function () {
			var str = "";
			for (var i = this.pos; i < this.expression.length; i++) {
				var c = this.expression.charAt(i);
				if (c.toUpperCase() === c.toLowerCase()) {
					if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
						break;
					}
				}
				str += c;
			}
			if (str.length > 0 && (str in this.ops2)) {
				this.tokenindex = str;
				this.tokenprio = 5;
				this.pos += str.length;
				return true;
			}
			return false;
		},

		isVar: function () {
			var str = "";
			for (var i = this.pos; i < this.expression.length; i++) {
				var c = this.expression.charAt(i);
				if (c.toUpperCase() === c.toLowerCase()) {
					if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
						break;
					}
				}
				str += c;
			}
			if (str.length > 0) {
				this.tokenindex = str;
				this.tokenprio = 4;
				this.pos += str.length;
				return true;
			}
			return false;
		},

		isComment: function () {
			var code = this.expression.charCodeAt(this.pos - 1);
			if (code === 47 && this.expression.charCodeAt(this.pos) === 42) {
				this.pos = this.expression.indexOf("*/", this.pos) + 2;
				if (this.pos === 1) {
					this.pos = this.expression.length;
				}
				return true;
			}
			return false;
		}
	};

	scope.Parser = Parser;
	return Parser
})(typeof exports === 'undefined' ? {} : exports);

},{}],22:[function(require,module,exports){
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

},{"bauer-factory":1,"events":13}]},{},[19]);
