// /import/aa/aa-core.js
// require none
/**
 * AA core library script.
 * Core Javascript language functionality.
 * Availability: Client window Javascript, Server nodeJS and Worker threads.
 * To import the script from a nodeJS server script: require(basePath+'import/aa/aa-core.js');
 * To import the script from a worker thread: self.importScripts(basePath+'import/aa/aa-core.js');
 */
(function () { 'use strict';

  /*
   * Globals and polyfills.
   */

  /**
   * Define the self/global namespace object and control properties.
   */
  (function () {
    if (typeof self == 'undefined') {global.self = global;} // Allow self in Server JS.
    if (self.isClient == null) {self.isClient = (typeof global == 'undefined');}
    if (self.isWorker == null) {self.isWorker = (typeof WorkerGlobalScope != 'undefined');}
    if (typeof global == 'undefined') {self.global = self;} // Allow global in Client JS.
    if (typeof window == 'undefined') {self.window = self;} // Allow window in Server JS.
    if (self.isFrame == null) {self.isFrame = !!(self.parent && self.parent.frames && self.parent.frames[0] && self.parent.frames[0] != self);}
  })();

  if (!Number.MAX_SAFE_INTEGER) {Number['MAX_SAFE_INTEGER'] = 9007199254740991;}
  if (!Number.EPSILON) {Number['EPSILON'] = 2.2204460492503130808472633361816e-16;}

  if (!('name' in Function.prototype)) {
    Object.defineProperty(Function.prototype, 'name', {get: function() {
      var c = ''+this; return c.substring(c.indexOf(' ')+1, c.indexOf('(')).trim();
    }});
  }

  if (!('values' in Object)) {
    Object.values = function (o) {return Object.keys(o).map(function (v, i, a) {return o[v];});};
  }

  if (!('findIndex' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'findIndex', {value: function (fun) {
      if (this == null || typeof fun != 'function') {throw new TypeError('Error in Array.findIndex.');}
      var v, i = 0, a = Object(this), len = a.length >>> 0, thisArg = arguments[1];
      while (i < len) {v = a[i]; if (fun.call(thisArg, v, i, a)) {return i;} i++;}
      return -1;
    }});
  }

  if (!('performance' in self)) {
    self.performance = {
      timing: {navigationStart: new Date().getTime()-1},
      now: function () {return new Date().getTime()-performance.timing.navigationStart;}
    };
  }

  if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
      return this.indexOf(search, start||0) != -1;
    };
  }

  if (!Array.prototype.includes) {Array.prototype.includes = String.prototype.includes;}

  if (!Math.tanh) {
    Math.tanh = function (x) {
      var a = Math.exp(+x), b = Math.exp(-x);
      return a == Infinity ? 1 : b == Infinity ? -1 : (a-b)/(a+b);
    };
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Define the AA framework namespace object.
   */
  (function () {
    if (typeof self == 'undefined') {global.self = global;}
    self.aa = self.aa||{};
    self.loading = self.loading||0; // General asynchronous loading counter.
    self.input = self.input||undefined; // Global temporary input placeholder.
    self.output = self.output||undefined; // Global temporary output placeholder.
    self.cluster = self.cluster||undefined; // Cluster reference, when defined previously with require in NodeJS.
    aa.vars = aa.vars||{}; // General properties container for persistent and temporary variables.
    aa.dat = aa.dat||{}; // Data module.
    aa.evt = aa.evt||{}; // Event module.
    aa.lay = aa.lay||{}; // Layout module, client only.
    aa.app = aa.app||{}; // Application module.
    aa.util = aa.util||{}; // Utilities module.
  })();

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
   * AA Data module.
   */

  aa.dat = aa.dat||{};

  /**
   * Merges properties of multiple passed objects into the first plain object argument.
   * The target object is modified and extended with properties in the other objects.
   * Matching keys are recursively merged if source and target values are plain objects.
   * To build a deep clone and avoid altering the source objects, prepend an empty object as the first argument.
   */
  aa.dat.merge = function () {
    for (var i = 0; i < arguments.length; i++) {
      var o = arguments[i]; if (!o || o.constructor != Object) {o = {};}
      if (t) {for (var k in o) {
        t[k] = (t[k] && o[k] && t[k].constructor == Object && o[k].constructor == Object) ? aa.dat.merge(t[k], o[k]) : o[k];
      }} else {var t = o;}
    }
    return t;
  };

  /**
   * Updates properties in the first plain object argument with values of matching properties in other passed objects.
   * Only existing properties in the target object are modified.
   * Matching keys are recursively merged if source and target values are plain objects.
   */
  aa.dat.update = function () {
    for (var i = 0; i < arguments.length; i++) {
      var o = arguments[i]; if (!o || o.constructor != Object) {o = {};}
      if (t) {for (var k in t) {
        if (k in o) {t[k] = (t[k] && o[k] && t[k].constructor == Object && o[k].constructor == Object) ? aa.dat.update(t[k], o[k]) : o[k];}
      }} else {var t = o;}
    }
    return t;
  };

  /**
   * Extends the first plain object argument with properties in other passed objects.
   * Existing properties in the the target object are not updated, unless they are null.
   */
  aa.dat.extend = function () {
    for (var i = 0; i < arguments.length; i++) {
      var o = arguments[i]; if (!o || o.constructor != Object) {o = {};}
      if (t) {for (var k in o) {if (t[k] == null) {t[k] = o[k];}}} else {var t = o;}
    }
    return t;
  };

  /**
   * Same as dat.merge but appends arrays rather than replacing them.
   */
  aa.dat.mergePush = function () {
    for (var i = 0; i < arguments.length; i++) {
      var o = arguments[i];
      if (t != null) {
        if (o && typeof o == 'object' && o.constructor != Array && t.constructor != Array) {
          for (const k in o) {
            if (!o.hasOwnProperty(k)) {continue;}
            if (t[k] && o[k] && typeof t[k] == 'object' && t[k].constructor == o[k].constructor) {
              aa.dat.mergePush(t[k], o[k]);
            } else {t[k] = o[k];}
          }
        } else if (t.constructor == Array) {
          if (o && o.constructor == Array) {[].push.apply(t, o);} else {t.push(o);}
        }
      } else {var t = o;} // (!o || typeof o != 'object') ? {} : o
    }
    return t;
  };

  /**
   * Returns a unique incremental integer.
   */
  aa.dat.count = function () {if (!aa.vars.counter || aa.vars.counter > Number.MAX_SAFE_INTEGER) {aa.vars.counter = 0;} return ++aa.vars.counter;};

  /**
   * Get timestamp in ms with fractional resolution.
   */
  aa.dat.time = function () {return new Date().getTime()+(performance.now()%1);};

  /**
   * Get a quick unique identifier.
   */
  aa.dat.uid = function (n) {return (n||'uid')+'_'+new Date().getTime()+('_'+Math.random()).substring(3);};

  /**
   * Escapes a regular expression to be used in string contexts.
   */
  aa.dat.regexpEscape = function (str) {return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');};

  /**
   * Checks if an object, array or string is empty. Null, number, boolean and function values always return true.
   */
  aa.dat.isEmpty = function (o) {
    var e = true; if (o) {for (var i in o) {if (o.hasOwnProperty(i)) {e = false; break;}}}
    return e;
  };

  /**
   * Checks if a value is a number. Use @param s true optionally to validate strictly primitive number types.
   */
  aa.dat.isNumber = function (v, s) {
    var bool = typeof v == 'number'; if (!bool && !s && v != null) {bool = v instanceof Number;}
    return bool;
  };

  /**
   * Returns a number if the passed value is a number or a valid number string, otherwise NaN.
   */
  aa.dat.getNumber = function (v) {
    if (typeof v != 'number') {
      v = (v != null && (v instanceof Number || ((typeof v == 'string' || v instanceof String) && v.trim().length))) ? Number(v) : NaN;
    }
    return v;
  };

  /**
   * Checks if reference is a scalar value. Use @param s true optionally to validate strictly primitive types.
   */
  aa.dat.isScalar = function (v, s) {
    var bool = typeof v == 'string' || typeof v == 'number' || typeof v == 'boolean';
    if (!bool && !s && v != null) {bool = v instanceof String || v instanceof Number || v instanceof Boolean;}
    return bool;
  };

  /**
   * Checks if an object is an array-like iterable, excluding strings.
   * For old browsers not supporting Symbol, IE <= 11, the existence of properties 'length', 'size' and 'count' is
   * tested, ensuring String and Function constructors are always skipped, (not fully safe, as prototypes can be added
   * properties of any name).
   */
  aa.dat.isArray = function (obj) {
    var proto = obj && obj.constructor && obj.constructor.prototype;
    return proto && obj.constructor != String && obj.constructor != Function
      && ((typeof Symbol != 'undefined') ? Symbol.iterator in proto
        : 'length' in proto || 'size' in proto || 'count' in proto);
  };

  /**
   * Casts any Iterable object to an Array. Same as Array.from().
   */
  aa.dat.castArray = function (arr) {if (arr) {arr = [].slice.call(arr);} return arr;};

  /**
   * Clears all items from an Array.
   */
  aa.dat.clearArray = function (arr) {
    arr && arr.splice && arr.splice(0, arr.length);
  };

  /**
   * Sets a nested property value in an object.
   * @param obj, Object containing the property, or the global/self container if null.
   * @param prop, String definition of the nested property, whose path uses the dot-separated notation.
   * @param val, the value assigned to the property.
   * @param dot, Optional String definition of the property's path separator, or the character dot, '.', if null.
   * @return a reference to the updated object.
   * The nested property, along with its parent containers, will be updated, or created if not present.
   * Example: var obj = {users: null}; aa.dat.setProp(obj, 'users.0.user-name', 'User Zero');
   * The updated object will be {users: [{'user-name': 'User Zero'}]}.
   */
  aa.dat.setProp = function (obj, prop, val, dot) {
    obj = obj||self; dot = dot||'.';
    var i, j, p = obj; prop = (''+prop).replace(/\[/g, dot).replace(/["'\]]/g, '').split(dot);
    while (prop.length) {
      i = prop.shift(); j = prop[0];
      if (i) {p[i] = (!j || typeof p[i] == 'object') ? p[i] : !isNaN(j) ? [] : {}; if (j) {p = p[i];}}
    }
    if (p && i in p) {p[i] = val;}
    return obj;
  };

  /**
   * Gets a nested property value from an object.
   * @param obj, Object containing the property, or the global/self container if null.
   * @param prop, String definition of the nested property, whose path uses the dot-separated notation.
   * @param dot, Optional String definition of the property's path separator, or the character dot, '.', if null.
   * @return the value of the contained nested property.
   * Example: var obj = {}, val = aa.dat.getProp(obj, 'users.0.user-name');
   * The returned value will be 'User Zero'. Also accepts 'users[0].user-name' or 'users[0].'user-name''.
   */
  aa.dat.getProp = function (obj, prop, dot) {
    var i, p; obj = obj||self; dot = dot||'.';
    prop = (''+prop).replace(/\[/g, dot).replace(/["'\]]/g, '').split(dot); if (!prop[0]) {prop.shift();}
    if (prop.length) {p = obj; for (i = 0; i < prop.length; i++) {if (p != null) {p = p[prop[i]];} else {break;}}}
    return p;
  };

  /**
   * Finds first index of a property value in an array of objects.
   * Requires aa.dat.getProp, which allows nested property names as dot separated strings.
   */
  aa.dat.indexOfProp = function (arr, nam, val) {
    return (arr||[]).findIndex(function (obj) {return aa.dat.getProp(obj, nam) == val;});
  };

  /**
   * Extracts an array of property values from an array of objects.
   * @param arr, Array[Object]: The array of objects to be searched.
   * @param prop, String: Property's dot-separated pathname, so nested objects can be searched.
   * @param dot, String, Optional. For map keys containing a dot '.', a different property separator can be used.
   * @return Array: The returned array will be of the same length as the original, with undefined values where the
   * property is not found.
   */
  aa.dat.arrayOfProp = function (arr, prop, dot) {
    var i, vals = []; arr = arr||[]; for (i = 0; i < arr.length; i++) {vals.push(aa.dat.getProp(arr[i], prop, dot));}
    return vals;
  };

  /**
   * Array of the occurrence indexes of a given value in either a String or an Array.
   * To find nested properties in an array of objects, combine with function aa.dat.arrayOfProp. Example:
   * var users = [{username: 'userzero', data: {firstname: 'John', lastname: 'Smith'}}];
   * var indexes = aa.dat.indexesOf(aa.dat.arrayOfProp(users, 'data.lastname'), 'Smith');
   */
  aa.dat.indexesOf = function (star, val) {
    var i, arr = [];
    if (!star || star.constructor == String) {
      star = ''+star; val = ''+val; i = -val.length; while ((i = star.indexOf(val, i+val.length)) != -1) {arr.push(i);}
    } else {for (i = 0; i < star.length; i++) {if (star[i] == val) {arr.push(i);}}}
    return arr;
  };

  /**
   * Escapes a string for readability.
   * @param s, optional boolean. Escapes to blank new lines and tabs.
   * @param h, optional boolean. Escapes to HTML source.
   */
  aa.dat.escapeString = function (str, s, h) {
    str = ''+str; while (str.indexOf('\\\\') != -1) {str = str.replace(/\\\\/g, '\\');}
    str = str.replace(/\\"/g, '"').replace(/\\'/g, '\'').replace(/\\`/g, '`').replace(/\\\//g, '/');
    if (s) {str = str.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');}
    if (h) {str = str.replace(/</g, '&lt;').replace(/\n/g, '<br/>\n');} // str.replace(/&lt;/g, '&amp;lt;')...
    return str.trim();
  };

  /**
   * Resolves an index value for a countable object, where negative values are counted backwards from the object length,
   * being -1 the length position and -2 the last item's position.
   * It returns -1 if the object parameter is not iterable.
   */
  aa.dat.resolveIndex = function (ctbl, index) {
    var length = !ctbl ? NaN : (typeof ctbl == 'string' || 'length' in ctbl)
        ? ctbl.length : ('size' in ctbl) ? ctbl.size : ('count' in ctbl) ? ctbl.count : NaN;
    if (!isNaN(length)) {
      if (index == null) {index = -1;}
      if (index < 0) {index += length+1;}
      if (index < 0) {index = 0;}
      if (index > length) {index = length;}
    } else {index = -1;}
    return index;
  };

  /**
   * Moves the position of an item in an array.
   */
  aa.dat.moveArrayItem = function (arr, fromIndex, toIndex) {
    fromIndex = aa.dat.resolveIndex(arr, fromIndex);
    toIndex = aa.dat.resolveIndex(arr, toIndex);
    if (fromIndex != toIndex && fromIndex < arr.length && toIndex < arr.length) {
      arr.splice(toIndex, 0, arr.splice(fromIndex, 1)[0]);
    }
  };

  /**
   * Gets the byte code of a string or buffer at a given position. No parameter validation.
   */
  aa.dat.charCodeAt = function (v, p) {return v.charCodeAt ? v.charCodeAt(p) : v[p];};

  /**
   * Gets the character of a string or buffer byte at a given position. No parameter validation.
   */
  aa.dat.charAt = function (v, p) {
    return v.charAt ? v.charAt(p) : (!(v = v[p]) || typeof v != 'number') ? '' : String.fromCharCode(v);
  };

  /**
   * Trims a string or buffer removing spaces, non-readable bytes lower than ASCII 32 and the encoding BOM.
   */
  aa.dat.trim = function (v) {
    if (v != null && v.slice) {
      var c, i = -1, j = v.length, START = i+1, END = j-1, MIN = 33, BOM = 0xfeff;
      if (v.charCodeAt) {
        while (((c = v.charCodeAt(++i)) < MIN || c == BOM) && i < j) {}
        while (((c = v.charCodeAt(--j)) < MIN || c == BOM) && i < j) {}
      } else if (typeof v[0] == 'number') {
        while (((c = v[++i]) < MIN || c == BOM) && i < j) {}
        while (((c = v[--j]) < MIN || c == BOM) && i < j) {}
      }
      if (i > START || j < END) {v = v.slice(i, j+1);}
    }
    return v;
  };

  /**
   * Quick check if a string seems to have an XML format, being enclosed in markup delimiters.
   */
  aa.dat.isLikeXml = function (v) {
    return (v != null && v.constructor == String && !!(v = v.trim()) && v.charAt(0) == '<' && v.charAt(v.length-1) == '>');
  };

  /**
   * Quick check if a string seems to have a JSON format, being enclosed in object or array delimiters.
   */
  aa.dat.isLikeJson = function (v) {
    return (
      v != null && v.constructor == String && !!(v = v.trim())
      && ((v.charAt(0) == '{' && v.charAt(v.length-1) == '}') || (v.charAt(0) == '[' && v.charAt(v.length-1) == ']'))
    );
  };

  /**
   * Parses a JSON string and returns an object, or null if the string is not JSON.
   */
  aa.dat.jsonObject = function (string) {
    var json = null; if (aa.dat.isLikeJson(string)) {try {json = JSON.parse(string);} catch (er) {}}
    return json;
  };

  /**
   * Formats a JSON string from an object or JSON string.
   * If @param format is false or null, the JSON string is minified, if it is true, the JSON string is padded.
   * If format is a number, it is used as the padding indentation.
   * If format is -1 and @param json is a string, it toggles the behaviour, minifying a padded string or padding a
   * minified string.
   * Returns the original value cast to string if it is not a valid JSON object.
   */
  aa.dat.jsonString = function (json, format, fun) { // format: false: minified, true: padded, number: padding, -1: toggle string format.
    if (json && json.constructor == String) {
      json = json.trim(); if (format < 0) {format = (json.length > 2 && json.indexOf('\n') == -1);}
      json = aa.dat.jsonObject(json)||json;
    } else if (format < 0) {format = null;}
    if (json && json.constructor != String) {
      format = (format && typeof format != 'number') ? 2 : null;
      try {json = JSON.stringify(json, fun, format);} catch (er) {}
    }
    return ''+(json||'');
  };

  /**
   * Compares if 2 objects are equal as stringified JSON values.
   */
  aa.dat.jsonEqual = function (object1, object2) {
    return object1 == object2 || aa.dat.jsonString(object1) == aa.dat.jsonString(object2);
  };

  /**
   * Tries evaluating a string as a Javascript expression.
   * Otherwise returns the value itself, unescaped and trimmed if it is a string, and null if it is empty.
   */
  aa.dat.evaluate = function (v) {
    if (v != null && v.constructor == String) {
      v = decodeURIComponent(v).trim();
      if (v.length) {try {v = eval('('+v+')');} catch (er) {}} else {v = null;}
    }
    return v;
  };

  /**
   * Tries evaluating a string as a Javascript expression if its content is enclosed in parentheses.
   * If the content is enclosed in braces or brackets, it tries parsing the string as a JSON object.
   * Otherwise returns the value itself, unescaped and trimmed if it is a string, and null if it is empty.
   */
  aa.dat.parse = function (v) {
    if (v != null && v.constructor == String) {
      v = decodeURIComponent(v).trim();
      if (v.length > 1) {
        var c0 = v.charAt(0), c1 = v.charAt(v.length-1);
        try {
          if ((c0 == '(' && c1 == ')') || (c1 == c0 && '"\'`'.indexOf(c0) != -1)) {v = eval(v);
          } else if ((c0 == '{' && c1 == '}') || (c0 == '[' && c1 == ']')) {v = JSON.parse(v);}
        } catch (er) {}
      } else if (!v.length) {v = null;}
    }
    return v;
  };

  /**
   * Parses a string query, like a URL query, into an object.
   */
  aa.dat.parseQuery = function (query, separator, joint, deep) {
    query = query||''; separator = separator||'&'; joint = joint||'=';
    var object = {}, array = query.split(separator);
    array.forEach((v, i, a) => {
      var j = v.indexOf(joint), value = v.substring(j+1), key = decodeURIComponent(v.substring(0, j)).trim()||('' + i);
      object[key] = !deep ? decodeURIComponent(value).trim() : aa.dat.evaluate(value);
    });
    return object;
  };

  /**
   * Sets a Date offset milliseconds.
   */
  aa.dat.setDate = function (date, ms) {if (ms && date instanceof Date) {date.setMilliseconds(date.getMilliseconds()+ms);}};

  /**
   * Gets a Date object with attached timezone offset minutes, week day and invalid flag. Optionally offset with milliseconds.
   */
  aa.dat.getDate = function (date, offset, ms) {
    if (offset == null && date && date.offset != null) {offset = date.offset;}
    date = (date == null) ? new Date() : new Date(date);
    if (''+date == 'Invalid Date') {date = new Date(0); date.invalid = true;} else {date.invalid = false;}
    if (ms) {aa.dat.setDate(date, ms);}
    date.offset = (offset != null) ? offset : -date.getTimezoneOffset();
    ms = new Date(date); aa.dat.setDate(ms, (date.offset+date.getTimezoneOffset())*60000); date.day = ms.getDay();
    return date;
  };

  /**
   * Gets a full date string in UTC + Timezone offset + Week day: '2019-03-29T03:17:41.541Z-480W4'.
   */
  aa.dat.getDateString = function (date, offset) {
    date = aa.dat.getDate(date, offset);
    return (date.toISOString()+date.offset).replace(/Z(\d)/, 'Z+$1')+'W'+date.day;
  };

  /**
   * Parses a Date string, as generated by aa.dat.getDateString.
   */
  aa.dat.parseDate = function (dateString) {
    var i, j, ms, offset; dateString = ''+dateString;
    i = dateString.indexOf('('); if (i != -1) {dateString = dateString.substring(0, i).trim();}
    i = dateString.indexOf('Z')+1;
    if (i) {
      offset = dateString.substring(i); dateString = dateString.substring(0, i).trim();
      i = offset.indexOf('W'); if (i == -1) {i = offset.length;}
      offset = Number(offset.substring(0, i).trim())||0;
    } else {
      i = dateString.indexOf('GMT'); j = dateString.indexOf('.')+1;
      if (j && j < i) {
        ms = dateString.substring(j, i).trim().substring(0, 3); while (ms.length < 3) {ms += '0';}
        ms = Number(ms)||0; dateString = dateString.substring(0, j-1)+' '+dateString.substring(i);
        i = dateString.indexOf('GMT');
      }
      if (i == -1) {i = dateString.length;}
      offset = dateString.substring(i+3).trim(); while (offset.length < 5) {offset += '0';}
      offset = (Number(offset.substring(0, 3))||0)*60+(Number(offset.charAt(0)+offset.substring(3))||0);
    }
    return aa.dat.getDate(dateString, offset, ms);
  };

  /**
   * Creates a function by parsing a string function definition.
   */
  aa.dat.parseFunction = function (fun) {
    try {
      eval('self._output = '+(''+fun).replace(/\{\s*\[native code\]\s*\}/, '{}'));
      fun = self._output; delete self._output;
    } catch (er) {fun = null;}
    return fun;
  };

  /**
   * Encodes a UTF8 string.
   * Typically used in combination with other encoding methods.
   * Examples: aa.dat.encodeB64(aa.dat.encodeUtf8(input)); aa.dat.zip(aa.dat.encodeUtf8(input));
   */
  aa.dat.encodeUtf8 = function (txt) {
    var utf = '', i, c; // txt = txt.replace(/\r\n/g, '\n'); // Hide/Show
    for (i = 0; i < txt.length; i++) {
      c = txt.charCodeAt(i);
      if (c < 128) {utf += String.fromCharCode(c);
      } else if (c < 2048) {utf += String.fromCharCode((c >> 6) | 192); utf += String.fromCharCode((c & 63) | 128);
      } else {utf += String.fromCharCode((c >> 12) | 224); utf += String.fromCharCode(((c >> 6) & 63) | 128); utf += String.fromCharCode((c & 63) | 128);}
    }
    return utf;
  };

  /**
   * Decodes a UTF8 string.
   * Typically used in combination with other decoding methods.
   * Examples: aa.dat.decodeUtf8(aa.dat.decodeB64(input)); aa.dat.decodeUtf8(aa.dat.unzip(input));
   */
  aa.dat.decodeUtf8 = function (utf) {
    var txt = '', i = 0, c1 = 0, c2 = 0, c3 = 0;
    while (i < utf.length) {
      c1 = utf.charCodeAt(i);
      if (c1 < 128) {i++; txt += String.fromCharCode(c1);
      } else if ((c1 > 191) && (c1 < 224)) {c2 = utf.charCodeAt(i+1); i += 2; txt += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {c2 = utf.charCodeAt(i+1); c3 = utf.charCodeAt(i+2); i += 3; txt += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));}
    }
    return txt;
  };

  /**
   * Encodes a Base64 string.
   */
  aa.dat.encodeB64 = function (input) { // Default B64 encoding, only IE10+: aa.dat.encodeB64 = function (str) {return btoa(encodeURIComponent(str));};
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var output = '', i = 0, chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    while (i < input.length) {
      chr1 = input.charCodeAt(i++); chr2 = input.charCodeAt(i++); chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2; enc2 = ((chr1 & 3) << 4) | (chr2 >> 4); enc3 = ((chr2 & 15) << 2) | (chr3 >> 6); enc4 = chr3 & 63;
      if (isNaN(chr2)) {enc3 = enc4 = 64;} else if (isNaN(chr3)) {enc4 = 64;}
      output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
  };

  /**
   * Decodes a Base64 string.
   */
  aa.dat.decodeB64 = function (input) { // Default B64 decoding, only IE10+: aa.dat.decodeB64 = function (str) {return decodeURIComponent(atob(str));};
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var output = '', i = 0, chr1, chr2, chr3, enc1, enc2, enc3, enc4, hLen = 256;
    input = input.substring(Math.max(input.lastIndexOf(':', hLen), input.lastIndexOf(';', hLen), input.lastIndexOf(',', hLen))+1); // input = input.replace(/[^A-Za-z0-9\+\/=]/g, '');
    while (i < input.length) {
      enc1 = keyStr.indexOf(input.charAt(i++)); enc2 = keyStr.indexOf(input.charAt(i++)); enc3 = keyStr.indexOf(input.charAt(i++)); enc4 = keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4); chr2 = ((enc2 & 15) << 4) | (enc3 >> 2); chr3 = ((enc3 & 3) << 6) | enc4;
      output += String.fromCharCode(chr1); if (enc3 != 64) {output += String.fromCharCode(chr2);} if (enc4 != 64) {output += String.fromCharCode(chr3);}
    }
    return output;
  };

  /**
   * Compresses a string using an LZW algorithm.
   */
  aa.dat.zip = function (ustring) {
    var i, c, wc, w = '', dictionary = {}, cstring = '', dictSize = 256; ustring = ''+(ustring||'');
    for (i = 0; i < dictSize; i++) {dictionary[String.fromCharCode(i)] = i;}
    for (i = 0; i < ustring.length; i++) {
      c = ustring.charAt(i); wc = w+c;
      if (dictionary.hasOwnProperty(wc)) {w = wc;} else {cstring += String.fromCharCode(dictionary[w]); dictionary[wc] = dictSize++; w = c;}
    }
    if (w != '') {cstring += String.fromCharCode(dictionary[w]);} // console.log('dat.zip: '+ustring.length+'x'+(cstring.length/ustring.length));
    return 'zip:'+cstring;
  };

  /**
   * Decompresses a string zipped with function aa.dat.zip.
   */
  aa.dat.unzip = function (cstring) {
    cstring = ''+(cstring||''); if (cstring.substring(0, 4) == 'zip:') {cstring = cstring.substring(4);}
    var i, k, w, dictionary = [], ustring, dictSize = 256;
    for (i = 0; i < dictSize; i++) {dictionary[i] = String.fromCharCode(i);}
    w = cstring.charAt(0); ustring = w;
    for (i = 1; i < cstring.length; i++) {
      k = cstring.charCodeAt(i); if (dictionary[k]) {k = dictionary[k];} else if (k == dictSize) {k = w+w.charAt(0);} else {return ustring;}
      ustring += k; dictionary[dictSize++] = w+k.charAt(0); w = k;
    } // console.log('dat.unzip: '+cstring.length+'x'+(ustring.length/cstring.length));
    return ustring;
  };

  /**
   * Tests recursively if two objects have equal keys and values.
   */
  aa.dat.equal = function (ob1, ob2) {
    if (ob1 != ob2) {
      if (ob1 != null && ob2 != null && ob1.constructor == ob2.constructor && (typeof ob1 == 'object' || typeof ob1 == 'function')) {
        if ((typeof (ob1.constructor.prototype||{})[(self.Symbol&&Symbol.iterator)||'length'] == 'undefined' || ob1 instanceof String || ob1 instanceof Function)
          && String(ob1.outerHTML||ob1.nodeValue||ob1) != String(ob2.outerHTML||ob2.nodeValue||ob2)) {return false;}
        var i, j = Object.keys(ob1), k = Object.keys(ob2); if (ob1 instanceof String) {j = j.filter(isNaN); k = k.filter(isNaN);}
        if (k.length != j.length) {return false;}
        for (i = 0; i < k.length; i++) {if (!(j[i] in ob2) || !(k[i] in ob1) || !aa.dat.equal(ob1[k[i]], ob2[k[i]])) {return false;}}
      } else {return false;} // console.log('equal '+ob1+' != '+ob2);
    }
    return true;
  };

  /**
   * Creates a plain object from a native object, ready for serialization with minimal loss, so it can be stringified to
   * JSON format and recovered later with function aa.dat.native.
   * Prevents cyclic redundancy in recursion, replacing duplicate values with a full path key pointer to the existing
   * property value, in the format 'CYCLIC:>key1>key2>...>key'.
   * Includes data properties added outside the prototype value.
   * Example: var serialized = JSON.stringify(aa.dat.plain(native));
   */
  aa.dat.plain = function (obj) {
    if ((typeof obj == 'object' || typeof obj == 'function') && obj != null && obj.constructor) {
      var dot = '>', path = arguments[1]||'CYCLIC:', vals = arguments[2]||[], keys = arguments[3]||[];
      var i, j, k = vals.indexOf(obj); if (k == -1) {vals.push(obj); keys.push(path);} else {return keys[k];}
      k = Object.keys(obj); plain = {_type: obj.constructor.name, _value: {}, _data: {}};
      if (typeof (obj.constructor.prototype||{})[(self.Symbol&&Symbol.iterator)||'length'] == 'undefined' || obj instanceof String || obj instanceof Function) {
        if (obj instanceof Error) {
          ['name', 'message', 'fileName', 'rowNumber', 'columnNumber', 'stack'].forEach(function (v, i, a) {plain._value[v] = aa.dat.plain(obj[v], path+dot+v, vals, keys);});
        } else if (obj instanceof String || obj instanceof Date || obj instanceof Function || (self.Node && obj instanceof Node)) {
          plain._value = String((obj.documentElement||obj).outerHTML||obj.nodeValue||(obj.toISOString&&obj.toISOString())||obj);
        } else if (obj instanceof Number) {plain._value = Number(obj);} else if (obj instanceof Boolean) {plain._value = Boolean(obj);
        } else {k = []; for (i in obj) {plain._value[i] = aa.dat.plain(obj[i], path+dot+i, vals, keys);}}
      } else {k = k.filter(isNaN); plain._value = []; for (i = 0; i < obj.length; i++) {plain._value.push(aa.dat.plain(obj[i], path+dot+i, vals, keys));}}
      for (i = 0; i < k.length; i++) {j = k[i]; if (!plain._value || typeof plain._value[j] == 'undefined') {plain._data[j] = aa.dat.plain(obj[j], path+dot+j, vals, keys);}}
      if (!Object.keys(plain._data).length) {delete plain._data;}
    } else if (typeof obj == 'symbol') {plain = String(obj);
    } else {plain = obj;}
    var plain; return plain;
  };

  /**
   * Creates a native object from a plain object, as generated by function aa.dat.plain.
   * Restores cyclic redundancy keys in recursion to their actual values.
   * Example: var native = aa.dat.native(JSON.parse(serialized));
   * Not all types of data can be fully recovered, for instance, Blob objects cannot be recovered synchronously.
   * Event and Error types are recovered as plain objects, since they are not reusable.
   * Iterable objects are recovered as arrays for simplicity and performance.
   * Unlike its counterpart, aa.dat.plain, this function requires other framework functions.
   */
  aa.dat.native = function (obj) {
    var i, v = 'CYCLIC:', dot = '>', top = arguments[1];
    if (top && obj != null && obj.constructor == String && obj.substring(0, v.length+dot.length) == v+dot) {
      obj = aa.dat.getProp(top, obj.substring(v.length+dot.length), dot);
    }
    if (obj == null || obj.constructor != Object || !('_value' in obj)) {return obj;}
    var nat = obj._value; if (nat == null || (nat.constructor == Object && '_value' in nat)) {return aa.dat.native(nat, top);}
    var type = self[obj._type]||nat.constructor, isTop = (!top && (typeof nat == 'object' || typeof nat == 'function'));
    if (aa.dat.isArray(nat)) {
      v = nat; nat = []; for (i = 0; i < v.length; i++) {nat.push(aa.dat.native(v[i], isTop ? nat : top));}
    } else if (nat.constructor == Object) {
      v = nat; nat = {}; for (i in v) {nat[i] = aa.dat.native(v[i], isTop ? nat : top);}
    } else if (type == Function) {nat = aa.dat.parseFunction(nat);
    } else if (self.Document && self.Node && type.prototype instanceof Node && !(type.prototype instanceof Document)) {
      v = document.createElement('div'); v.innerHTML = (nat||''); nat = v.childNodes[0];
    } else {try {nat = new type(nat);} catch (er) {}}
    if (obj._data && nat != null && (typeof nat == 'object' || typeof nat == 'function')) {
      for (i in obj._data) {nat[i] = aa.dat.native(obj._data[i], isTop ? nat : top);}
    }
    return nat;
  };

  /**
   * Applies a data object to a text or HTML template using wildcards for values, containers and iterators.
   * By default, uses the Mustache wildcard syntax. Optionally, wildcards can be defined in the syntax parameter:
   *   {OP: '{{', CL: '}}', CC: '#', CN: '^', CE: '/', JS: 'js:'}
   * Some external conventions use syntax {OP: '#{', CL: '}'} for localized text replacements.
   * Additionally, wildcard keys starting with 'js:' will be replaced by their evaluated expression.
   * Test example:
   *   aa.dat.renderTemplate(
   *     '<ul>{{#listArray}}<li x-id='{{itemName}}-{{itemIndex}}'>{{js:'\\x7b\\x7b\\x7d\\x7d'}}{{#isImportant}}<b>{{itemValue}}</b>{{/isImportant}}{{#listArray}}AA{{/listArray}}{{^isImportant}}<i>{{itemValue}}</i>{{/isImportant}}{{^listArray}}BB{{/listArray}}</li>{{/listArray}}</ul>'
   *     , {listArray: [{itemIndex: 0, itemName: 'item', itemValue: 'Important value {{}}', isImportant: true}, {itemIndex: 1, itemName: 'item', itemValue: 'Regular value {{}}', listArray: true}]}
   *   );
   * Will return string:
   *   <ul><li x-id='item-0'>{{}}<b>Important value {{}}</b>BB</li><li x-id='item-1'>{{}}AA<i>Regular value {{}}</i></li></ul>
   */
  aa.dat.renderTemplate = function (text, data, syntax) {
    syntax = syntax||{}; text = (text == null) ? '' : ''+text; if (data == null) {return text;}
    var OP = syntax.OP||'{{', CL = syntax.CL||'}}', CC = syntax.CC||'#', CN = syntax.CN||'^', CE = syntax.CE||'/', JS = syntax.JS||'js:';
    var i, j, k, n = 0, ol = OP.length, cl = CL.length, jl = JS.length, c0 = OP.charAt(ol-1), c1 = CL.charAt(cl-1);
    var rx = new RegExp('[\\'+CC+'\\'+CN+'\\'+CE+'\\'+c0+'\\'+c1+']', 'g');
    var jx = new RegExp('\\\\x([0-9A-Fa-f]{2})', 'g'), jx1 = new RegExp('\\\\u([0-9A-Fa-f]{4})', 'g');
    while ((i = text.indexOf(OP, n)) != -1 && (j = text.indexOf(CL, (n = i+ol))) != -1) {
      if (text.charAt(n) == c0 && text.charAt(j+cl) == c1) {j++; n++;}
      var kl = 0, param = null, sub = '', val = '', key = text.substring(n, j).trim(), isNot = (text.charAt(n) == CN);
      if (jl && key.substring(0, jl) == JS) {
        key = key.replace(jx, '\\x$1').replace(jx1, '\\u$1');
        try {param = eval(key.substring(jl));} catch (er) {}
      } else {key = key.replace(rx, ''); kl = key.length; param = data[key];}
      if (kl && (isNot || text.charAt(n) == CC)) {
        n = j+cl; k = text.indexOf(OP+CE+key+CL, n);
        while (k != -1 && ((sub = text.substring(n, k)).indexOf(OP+CC+key+CL) != -1 || sub.indexOf(OP+CN+key+CL) != -1)) {
          n = k+ol+1+kl+cl; k = text.indexOf(OP+CE+key+CL, n);
        }
        if (k == -1) {k = text.length;}
        sub = text.substring(j+cl, k); j = k+ol+1+kl;
        if (!isNot && param && typeof param == 'object' && 'length' in param) {
          for (var itm in param) {val += aa.dat.renderTemplate(sub, param[itm]);}
        } else if (isNot || param == null || typeof param == 'boolean' || !isNaN(param)) {
          param = isNot ? !param : !!param; val = !param ? '' : aa.dat.renderTemplate(sub, data);
        } else {val = aa.dat.renderTemplate(sub, param);}
      } else {val = param;}
      val = (val == null) ? '' : ''+val; text = text.substring(0, i)+val+text.substring(j+cl); n = i+val.length;
    }
    return text;
  };

  /**
   * Gets the minimum number of bits in a positive number. Zero for not numbers or negative numbers.
   */
  aa.dat.getBitSize = function (num) {return (num == null || isNaN(num) || num < 0) ? 0 : Math.floor(Math.log(num||1)/Math.LN2)+1;};

  /**
   * Gets a bit at a position in a number.
   */
  aa.dat.getBitAt = function (num, pos) {return (num >> pos) & 1;};

  /**
   * Sets a bit at a position in a number.
   * @param val can be 0 (false), 1 (true) or -1 (invert).
   */
  aa.dat.setBitAt = function (num, pos, val) {
    var mask = 1 << pos;
    if (val == 1) {num |= mask;
    } else if (val == 0) {num &= ~mask;
    } else if (val == -1) {num ^= mask;}
    return num;
  };

  /**
   * Gets the array of bits in a number.
   */
  aa.dat.numberToBits = function (num) {
    var arr = [], rem = num; if (num == 0) {return [0];}
    while (rem > 0) {rem >>= 1; arr.unshift((num >> arr.length) & 1);}
    return arr;
  };

  /**
   * Gets the number in an array of bits.
   */
  aa.dat.bitsToNumber = function (arr) {
    var i, len = (arr||[]).length, num = 0; if (!len) {return NaN;}
    for (i = 0; i < len; i++) {num += arr[len-i-1]*Math.pow(2, i);}
    return num;
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
   * AA Event Module.
   */

  aa.evt = aa.evt||{};

  /**
   * Debounces a redundant event trigger in favor of the last dispatch (or the first one, if @param delay is negative).
   * @param delay. The interval threshold below which the dispatch is postponed. The default value is 300 ms.
   * @param fun. The callback funtion to be invoked.
   * Example: aa.evt.onresize = aa.evt.debounce(function (ev) {...});
   */
  aa.evt.debounce = function (fun, delay) {
    var lead = false, timeout = 0; if (delay == null) {delay = 300;} else if (delay < 0) {delay *= -1; lead = true;}
    return function () {
      var context = this, args = arguments, callnow = (lead && !timeout);
      clearTimeout(timeout); timeout = setTimeout(function () {timeout = 0; if (!lead) {fun.apply(context, args);}}, delay);
      if (callnow) {fun.apply(context, args);}
    };
  };

  /**
   * Throttles a redundant event trigger to avoid frequent dispatches.
   * @param delay. The frequency threshold below which the dispatch is skipped. The default value is 300 ms.
   * @param fun. The callback funtion to be invoked.
   * Example: aa.evt.onresize = aa.evt.throttle(function (ev) {...});
   */
  aa.evt.throttle = function (fun, delay) {
    var last = null, timeout = 0; if (delay == null) {delay = 300;}
    return function () {
      var context = this, args = arguments;
      if (last != null) {
        clearTimeout(timeout); timeout = setTimeout(function () {
          var now = Date.now(); if (now-last >= delay) {fun.apply(context, args); last = now;}
        }, delay+last-Date.now());
      } else {fun.apply(context, args); last = Date.now();}
    }
  };

  /**
   * Normalizes a consistent cross-browser and server error event.
   */
  aa.evt.normalizeError = function (msg, url, row, col, err) {
    if (!err) {if (msg instanceof Error) {err = msg; msg = '';} else {err = new Error();}}
    err.name = err.name||err.constructor.name||'Error'; msg = err.message = err.message||msg||'';
    err.fileName = err.fileName||url||''; err.rowNumber = err.rowNumber||row||0; err.columnNumber = err.columnNumber||col||0;
    err.stack = err.stack || (err.message+'\n'+err.fileName+':'+err.rowNumber+':'+err.columnNumber);
    if (msg.indexOf(err.name+':') == -1) {msg = err.name+': '+msg;}
    if (err.stack.indexOf(msg.substring(msg.indexOf(' ')+1)) == -1) {err.stack = msg+'\n'+err.stack;}
    err.stack = err.stack.replace(/\\/g, '/');
    return err;
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
   * AA Application module.
   */

  aa.app = aa.app||{};

  /**
   * Exposes self as the global scope in all javascript environments, server, client and worker.
   * The top level environment is already referenced in this module with both 'self' and 'global' aliases.
   * The self reference is defined in the global sope if not defined:
   *   if (typeof self == 'undefined') {global.self = global;}
   */
  aa.app.getSelf = function () {
    if (typeof self == 'undefined') {global.self = global;}
    return self;
  };

  /**
   * Gets the absolute base path of the application, which is stored in aa.vars.basePath.
   */
  aa.app.getBasePath = function () { // require.main vs deprecated process.mainModule
    return (self.location && location.host) ? '//'+location.host+location.pathname :
      require.main.filename.substring(0, (require.main.filename.lastIndexOf('/')+1)||(require.main.filename.lastIndexOf('\\')+1))
        .replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/');
  };

  /**
   * Calls a script expecting a global input and returning a global output.
   * @param js, String: JS code to eval or path to require when JS is running on the server side.
   * The require path parameter may need to be rebased if called from a different location.
   * @param inp, Object, optional: Input object to be mapped to self.input.
   * @param keep, Boolean, optional: If true, self.input object will not be destroyed after processing the script.
   * @param fun, Function, optional: Function to be invoked, by default eval, or require if parameter js is a file path.
   * @return out, Object: Output returned from self.output object in the script.
   */
  aa.app.callJS = function (js, inp, keep, fun) {
    var out; js = (js == null) ? '' : ''+js;
    fun = fun || (typeof require != 'function' || js.indexOf('\n') != -1 || (js.indexOf(' ') != -1 && js.indexOf(';') != -1 && js.indexOf('(') != -1))
    ? function (s) {return eval(s);} : function (s) {return require(s);};
    self.output = undefined; self.input = inp;
    try {out = fun(js); if (typeof out == 'undefined') {out = self.output;}} catch (er) {} // console.log('callJS error '+js.substring(0, 512), er.stack);
    self.output = undefined; if (!keep) {self.input = undefined;}
    return out;
  };

  /**
   * Builds an object with URL location properties: hash, host, hostname, href, origin, pathname, port, protocol, search.
   * Plus root, userpath, username, password, hostcontext, hostdomain, dirpath, context, folder, filename, filebase and fileext.
   * The full URL is stored in the href property, and can also be reconstructed using combined parts:
   * root+userpath+host+pathname+search+hash
   * root+userpath+hostname+port+dirpath+filename+search+hash
   */
  aa.app.urlParts = function (url) {
    var i, n; url = (url == null) ? '' : ''+url;
    var urp = {
      href: url, hash: '', host: '', hostname: '', origin: '', pathname: '', port: '', protocol: '', search: '',
      root: '', userpath: '', username: '', password: '', hostcontext: '', hostdomain: '',
      dirpath: '', context: '', folder: '', filename: '', filebase: '', fileext: ''
    };
    i = url.indexOf('#'); if (i != -1) {urp.hash = url.substring(i); url = url.substring(0, i);}
    i = url.indexOf('?'); if (i != -1) {urp.search = url.substring(i); url = url.substring(0, i);}
    i = url.indexOf(':/')+1; urp.protocol = urp.root = url.substring(0, i); url = url.substring(i);
    while (i && url.charAt(0) == '/') {urp.root += url.charAt(0); url = url.substring(1);}
    if ((i = url.indexOf('@')+1)) { // Hide/Show: && i <= url.indexOf('/')
      urp.userpath = n = url.substring(0, i); url = url.substring(i);
      n = n.substring(0, n.length-1); i = n.indexOf(':'); if (i == -1) {i = n.length;}
      urp.username = n.substring(0, i); urp.password = n.substring(i+1);
    }
    i = url.indexOf('/'); if (i == -1) {i = url.length;}
    urp.host = url.substring(0, i); urp.pathname = url.substring(i); urp.origin = urp.root+urp.host;
    url = urp.host; i = url.indexOf(':'); if (i == -1) {i = url.length;}
    urp.hostname = url.substring(0, i); urp.port = url.substring(i);
    url = urp.hostname; i = url.indexOf('.'); if (i == -1) {i = url.length;}
    urp.hostcontext = url.substring(0, i); i = url.lastIndexOf('.'); if (i != -1) {urp.hostdomain = url.substring(i);}
    url = urp.pathname; i = url.lastIndexOf('/')+1; urp.dirpath = url.substring(0, i); urp.filename = url.substring(i);
    url = urp.dirpath; i = url.indexOf('/', 1)+1; if (!i) {i = url.length;}
    urp.context = url.substring(0, i); url = url.substring(i);
    i = url.lastIndexOf('/', url.length-2)+1; urp.folder = url.substring(i);
    url = urp.filename; i = url.lastIndexOf('.'); if (i == -1) {i = url.length;}
    urp.filebase = url.substring(0, i); urp.fileext = url.substring(i);
    return urp;
  };

  /**
   * Normalizes a URL string with forward slash separators.
   * @param url: String. The source URL string.
   * @param tail: Number, Optional. Value 1 ensures the URL separator is present at the end of the path. Value -1
   * ensures it is not present. Value 0 appends it if not present and the last name is not a dotted filename.
   * If tail is null or undefined (default), it leaves the end of the path unchanged.
   */
  aa.app.normalizeUrl = function (url, tail) {
    var i, purl = '', surl = ''; url = (url == null) ? '' : ''+url;
    i = url.indexOf('#'); if (i != -1) {surl = url.substring(i); url = url.substring(0, i);}
    i = url.indexOf('?'); if (i != -1) {surl = url.substring(i)+surl; url = url.substring(0, i);}
    url = url.replace(/\\/g, '/'); i = url.indexOf(':')+1;
    if (i && i <= url.indexOf('/')) {purl = url.substring(0, i); url = url.substring(i);}
    while (url.charAt(0) == '/' && (purl.indexOf('/') == -1 || purl == 'file:/')) {purl += '/'; url = url.substring(1);}
    url = url.replace(/\/{2,}/g, '/'); i = url.charAt(url.length-1);
    if (tail == 0 && i && i != '/' && url.lastIndexOf('.') <= url.lastIndexOf('/')) {tail = 1;}
    if (tail < 0 && i == '/') {url = url.substring(0, url.length-1);} else if (tail > 0 && i != '/') {url += '/';}
    return purl+url+surl;
  };

  /**
   * Extracts a normalized relative path part from a URL, to match equivalent URLs resolved in different ways.
   * @param enclose: Number, Optional. Value 1 ensures the path separator is present at the start and not at the end,
   * value -1 ensures it is present at the end and not at the start, value 2 ensures both ends are enclosed by
   * separators, value -2 ensures both ends are not enclosed by separators, and value 0 (default) ensures the separator
   * is present at the start and, at the end, only when the last name is not a dotted filename.
   * Returned path is normalized with forward slash separators.
   * The following URLs have the same normalized URI, '/dir/dir/notfile/':
   * aa.app.urlCore('http://host/dir/dir/notfile?p1=v1#a1')
   * aa.app.urlCore('../../dir/dir/notfile?p2=v2#a2')
   * aa.app.urlCore('https://127.0.0.1:80/dir/dir/notfile/?p3=v3#a3')
   * Equal paths example: (aa.app.urlCore(firstUrl, 2) == aa.app.urlCore(secondUrl, 2))
   * Relative sub-path example: (aa.app.urlCore(absoluteUrl, 2).indexOf(aa.app.urlCore(relativeUrl, 2)) != -1)
   * Document selector example: document.querySelector('[href*=''+aa.app.urlCore(url)+'']')
   */
  aa.app.urlCore = function (url, enclose) {
    var i; url = (url == null) ? '' : ''+url; enclose = enclose||0;
    i = url.indexOf('#'); if (i != -1) {url = url.substring(0, i);}
    i = url.indexOf('?'); if (i != -1) {url = url.substring(0, i);}
    url = url.replace(/\\/g, '/'); i = url.indexOf(':')+1; if (i && i <= url.indexOf('/')) {url = url.substring(i);}
    url = url.replace(/^(\/{2,}[^\/]+\/?)/, '/').replace(/^\.+\//, '/');
    if (enclose == -1 || enclose == 2 || (!enclose && url.length && url.lastIndexOf('.') <= url.lastIndexOf('/'))) {url += '/';}
    if (enclose > 0 || (!enclose && url.length)) {url = '/'+url;}
    i = /\/\.*\/+/g; while (i.test(url)) {url = url.replace(i, '/');}
    i = url.length-1; if (url.charAt(i) == '/' && ((enclose == 1 && i > 0) || enclose == -2)) {url = url.substring(0, i);}
    if (url.charAt(0) == '/' && ((enclose == -1 && i > 0) || enclose == -2)) {url = url.substring(1);}
    return url;
  };

  /**
   * Extracts a section of path folders of a URL.
   * @param url, String. The URL to be extracted the pathname.
   * @param len, Number. The number of folders in the returned path, or, if negative, the number of folders to skip.
   * Example 'http://host/context/folder1/folder2', len = 1 returns '/context', len = -1 returns '/folder1/folder2'.
   */
  aa.app.sliceUrlCore = function (url, len) {
    var i; url = aa.app.urlCore(url, 2);
    if (len > 0) {
      i = 0; while (len-- && i != -1) {i = url.indexOf('/', i+1);}
      url = url.substring(0, i != -1 ? i : url.length);
    } else if (len < 0) {while (len++ && url) {url = url.substring(url.indexOf('/', 1));}}
    i = url.length-1; if (i > 0 && url.charAt(i) == '/') {url = url.substring(0, i);}
    return url;
  };

  /**
   * Encodes the query values of a URL.
   */
  aa.app.encodeUrlQuery = function (url) {
    var i, s, a, que = '', tail = '';
    url = ''+(url||''); i = url.indexOf('#', url.lastIndexOf('=')+1);
    if (i != -1) {tail = url.substring(i); url = url.substring(0, i);}
    if ((i = url.indexOf('?')+1)) {que = url.substring(i); url = url.substring(0, i);
    } else if (url.indexOf('=') == -1) {return url;}
    a = que.split('&');
    for (i = 0; i < a.length; i++) {
      s = a[i].indexOf('=')+1; a[i] = a[i].substring(0, s)+encodeURIComponent(a[i].substring(s));
    }
    return url+a.join('&')+tail;
  };

  /**
   * Creates an object from a URL encoded query string.
   */
  aa.app.parseUrlQuery = function (url) {
    var i, s, n, a, obj = {};  url = ''+(url||''); i = url.indexOf('#'); if (i != -1) {url = url.substring(0, i);}
    if ((i = url.indexOf('?')+1)) {url = url.substring(i);
    } else if (url.indexOf('=') == -1) {return obj;}
    a = url.split('&');
    for (i = 0; i < a.length; i++) {
      s = a[i].indexOf('='); n = decodeURIComponent(a[i].substring(0, s)).trim();
      try {obj[n||('arg'+i)] = aa.dat.evaluate(a[i].substring(s+1));} catch (er) {}
    }
    return obj;
  };

  /**
   * Builds a URL encoded query string from an object.
   */
  aa.app.buildUrlQuery = function (obj) {
    var i, uque = '';
    if (typeof obj == 'object') {
      for (i in obj) {
        if (typeof obj[i] == 'object') {obj[i] = aa.dat.jsonString(obj[i]);}
        uque += (!uque ? '' : '&')+i+'='+encodeURIComponent(obj[i]);
      }
    } else if (obj != null) {uque = ''+obj;}
    if (uque.charAt(0) != '?') {uque = '?'+uque;}
    return uque;
  };

  /**
   * Builds an object with name-value pairs from a header string like XMLHttpRequest.getAllResponseHeaders.
   */
  aa.app.parseHeaders = function (hdr) {
    var i, j, headers = {}; hdr = !hdr ? [] : hdr.split('\n');
    for (i = 0; i < hdr.length; i++) {
      j = hdr[i].indexOf(':'); if (j > 0) {headers[hdr[i].substring(0, j).trim()] = hdr[i].substring(j+1).trim();}
    }
    return headers;
  };

  /*
   * Workers Sub-module.
   */

  aa.app.workers = aa.app.workers||[];

  /**
   * Loads a new worker script.
   * @param inp, object, optional. Input object to initialize the worker.
   * Property inp.url, string, optional. If not defined, a generic worker script is created from a Blob URL object.
   * Property inp.basePath, string optional. The base path in the worker scope.
   * @param fun, Function, optional. Callback function to process the worker's response messages.
   * The generic worker accepts and processes JS code messages, then updates the property worker.output in return.
   * Example:
   *   var wrk = aa.app.loadWorker('', function (wk) {console.log('loadWorker callback '+aa.app.workers.indexOf(wk), wk.output);});
   *   wrk.postMessage('('+function (inp) { 'use strict';
   *     inp = inp||{}; inp.basePath = inp.basePath||'';
   *     self.input = inp; self.output = {};
   *     self.importScripts(inp.basePath+'import/aa/modules/aa-core.js');
   *     self.output.info = 'Script context: client '+self.isClient+' / worker '+self.isWorker;
   *     self.output.count = 0;
   *     var time = new Date().getTime();
   *     self.run = function () {
   *       for (var i = 0; i < 1e6; i++) {self.output.count++;}
   *       self.output.time = new Date().getTime()-time;
   *       setTimeout(self.run, 0);
   *     };
   *     self.run();
   *   }+')('+JSON.stringify(wrk.input)+');');
   *   setTimeout(function () {wrk.postMessage('?output'); aa.app.unloadWorker(wrk);}, 1e4);
   */
  aa.app.loadWorker = function (inp, fun) {
    var url; inp = inp||{}; if (inp.constructor != Object) {inp = {url: inp};}
    if (!inp.url && typeof URL != 'undefined' && typeof Blob != 'undefined') {
      url = new Blob(['self.onmessage = '+function (ev) {
        var msg = ''+ev.responseData;
        if (msg.charAt(0) == '?') {
          msg = eval(msg.substring(1));
          if (typeof msg == 'object' && msg != null) {msg = JSON.stringify(msg);}
          self.postMessage(''+msg);
        } else {eval(msg);}
      }+';']);
      url = URL.createObjectURL(url); setTimeout(URL.revokeObjectURL, 0, url);
      inp.url = ''; if (inp.basePath == null) {inp.basePath = aa.nn.vars.basePath;}
    } else {
      url = inp.url; if (inp.url.constructor != String) {inp.url = '';}
      if (inp.basePath == null) {inp.basePath = '';}
    }
    var wrk = new Worker(url); wrk.input = inp; if (aa.app.workers) {aa.app.workers.push(wrk);}
    wrk.onmessage = function (ev) {
      var msg = ''+ev.responseData;
      if (msg.charAt(0) == '?') {
        var i = msg.substring(1); msg = eval(i);
        if (typeof msg == 'object' && msg != null) {msg = JSON.stringify(msg);}
        wrk.postMessage(i+' = '+msg);
      } else {wrk.output = (msg.charAt(0) == '{' || msg.charAt(0) == '[') ? JSON.parse(msg) : msg;}
      if (fun) {fun(wrk);}
    };
    wrk.onerror = function (er) {wrk.error = er; if (fun) {fun(wrk);}};
    return wrk;
  };

  /**
   * Terminates a worker.
   */
  aa.app.unloadWorker = function (wrk) {
    var i = !aa.app.workers ? -1 : aa.app.workers.indexOf(wrk); if (i != -1) {aa.app.workers.splice(i, 1);}
    if (wrk && wrk.postMessage) {wrk.postMessage('self.close();');}
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
   * AA variables and values.
   */

  aa.vars.basePath = aa.app.getBasePath();
  aa.vars.ms = {FRAME: 16, PLAY: 33, LISTEN: 66, WATCH: 300, REFRESH: 600, UPDATE: 2e3, WAIT: 9e3, TIMEOUT: 3e4, FORGET: 4e5};
  aa.vars.TOP_INT = 8904885761771999; // Close to MAX_SAFE_INTEGER with high divisibility (TOP_INT+1).

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
   * Run/export module.
   */

  if (!self.isClient) {
    console.log('\n[' + new Date().toISOString() + '] \'Module aa-core.js\'\n'); // Show/Hide.
    module.exports = aa;
  }

})();
